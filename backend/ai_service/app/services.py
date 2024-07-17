import langchain
from langchain_openai import ChatOpenAI
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS
from langchain.document_loaders import PyPDFDirectoryLoader, PyPDFLoader
from langchain.embeddings.openai import OpenAIEmbeddings
from langchain.output_parsers import OutputFixingParser
from langchain.output_parsers import RetryOutputParser
from langchain_core.output_parsers import JsonOutputParser
from .models import List_of_charts, GreenBuildingArea, LandsConserved, WasteDivertedFromLandfill, CO2Avoided, EnergySaved, TotalRenewableCapacity, NewRenewableCapactity, RenewableCapactity, Comparative_Chart
from langchain import PromptTemplate, LLMChain
from langchain_core.runnables import RunnablePassthrough, RunnableLambda, RunnableParallel
from langchain.agents import Tool, initialize_agent
from langchain.utils.math import cosine_similarity
from langchain.chains.summarize import load_summarize_chain
import subprocess
import numpy as np
import json
import os

def get_summary(logs):
    llm = getLLM()
    text_splitter = RecursiveCharacterTextSplitter(chunk_size= 2000, chunk_overlap=20)
    texts = text_splitter.create_documents([logs])
    chain = load_summarize_chain(llm, chain_type="stuff")
    summary = chain.run(texts)
    filename = './ImpFiles/data.json'
    os.makedirs(os.path.dirname(filename), exist_ok=True)
    with open(filename, 'r') as f:
        data = json.load(f) 
    return {"Summary": summary, "Data": data}

def load_document(path):
    loader = PyPDFDirectoryLoader(path)
    documents = loader.load()
    return documents

def split_documents(documents, chunk_size = 1000, chunk_overlap = 10):
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=chunk_size, chunk_overlap = chunk_overlap)
    split_documents = text_splitter.split_documents(documents)
    return split_documents

def query_model(query):
    """Queries the LLM to get the answer to a specific query"""
    knowledge_embeddings = getEmbeddings()
    db = FAISS.load_local('faiss_index',knowledge_embeddings, allow_dangerous_deserialization=True)
    
    prompt = PromptTemplate(
        template = """
            You are a helpful LLM who is there to assist the user and explain any data points. 
            Only use from the data that is present and relevant to the question at hand. Do not add any external information. 
            You will have two datasources. Datasource1 is a JSON object of information scraped for many files, this is the more reliable data.
            Datasource2 is relevant documents taken from a vector database, use this for supplementing information.
            Make sure your answer is too the point and relevant.Just give me the answer directly with some analysis.

            question: {question} \n
            Datasource 1: {data1} \n 
            Datasource 2: {data2} \n \n 
            According to the data provided,""",
        input_variables=["question", "data1", "data2"]
    )
    filename = './ImpFiles/data.json'
    os.makedirs(os.path.dirname(filename), exist_ok=True)
    with open(filename, 'r') as f:
        data = json.load(f) 
    llm = getLLM()
    chain = prompt | llm 
    relevant_docs = retrieve_info(query)
    ans = dict(chain.invoke({"question":query , "data1":data, "data2":relevant_docs}))
    # print(ans)
    # ans['type'] = 'llm-response'
    return {'type': 'llm-response', 'content': ans['content']}
    
def getEmbeddings():
    CHOSEN_LITE_LLM_EMBEDDING_MODEL = 'Amazon Titan - Bedrock Text Embedding v2 (Internal)'    
    litellm_proxy_endpoint = os.environ.get(
        "litellm_proxy_endpoint",
        "https://gq8rdw5man.us-east-1.awsapprunner.com")

    bearer_token = 'sk-mbmkDl1ILRJB6d6PIwmHKQ'

    embeddings: OpenAIEmbeddings = OpenAIEmbeddings(
        model= CHOSEN_LITE_LLM_EMBEDDING_MODEL,
        openai_api_base=litellm_proxy_endpoint,
        openai_api_key=bearer_token,
        user=bearer_token
    )

    return embeddings

def getLLM(temperature = 0, model = 'Anthropic Claude-V3 (Internal)'):
    bearer_token = 'sk-mbmkDl1ILRJB6d6PIwmHKQ'
    litellm_proxy_endpoint = os.environ.get(
    "litellm_proxy_endpoint",
    "https://gq8rdw5man.us-east-1.awsapprunner.com")
    chat = ChatOpenAI(
        openai_api_base=litellm_proxy_endpoint,
        model = model,
        temperature=temperature,
        api_key=bearer_token,
        streaming=False,
        user=bearer_token
    )
    return chat

def setup():
    CHOSEN_LITE_LLM_EMBEDDING_MODEL = 'Amazon Titan - Bedrock Text Embedding v2 (Internal)'
    litellm_proxy_endpoint = os.environ.get(
        "litellm_proxy_endpoint",
        "https://gq8rdw5man.us-east-1.awsapprunner.com")
    bearer_token = 'sk-mbmkDl1ILRJB6d6PIwmHKQ'
    embeddings: OpenAIEmbeddings = OpenAIEmbeddings(
        model= CHOSEN_LITE_LLM_EMBEDDING_MODEL,
        openai_api_base=litellm_proxy_endpoint,
        openai_api_key=bearer_token,
        user=bearer_token
    )
    loader = PyPDFDirectoryLoader('./app/Files')
    documents = loader.load()
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap = 10)
    split_documents = text_splitter.split_documents(documents)

    db = FAISS.from_documents(split_documents, embeddings)

    db.save_local("faiss_index")
    return {"code":"Success"}

def retrieve_info(query):
    CHOSEN_LITE_LLM_EMBEDDING_MODEL = 'Amazon Titan - Bedrock Text Embedding v2 (Internal)'
    litellm_proxy_endpoint = os.environ.get(
        "litellm_proxy_endpoint",
        "https://gq8rdw5man.us-east-1.awsapprunner.com")
    bearer_token = 'sk-mbmkDl1ILRJB6d6PIwmHKQ'
    embeddings: OpenAIEmbeddings = OpenAIEmbeddings(
        model= CHOSEN_LITE_LLM_EMBEDDING_MODEL,
        openai_api_base=litellm_proxy_endpoint,
        openai_api_key=bearer_token,
        user=bearer_token
    )
    db = FAISS.load_local("faiss_index", embeddings, allow_dangerous_deserialization=True)
    similar_response = db.similarity_search("What are Apple's Inititatives", k=5)
    page_contents_array = [doc.page_content for doc in similar_response]
    return page_contents_array

def generatePlots(query):
    """Based on some query generates a relevant graph that can be used to display the data"""
    knowledge_embeddings = getEmbeddings()
    db = FAISS.load_local('faiss_index',knowledge_embeddings, allow_dangerous_deserialization=True)
    parser = JsonOutputParser(pydantic_object=List_of_charts)
    
    prompt = PromptTemplate(
        template = """You are a chart generation LLM who given some data and a task. 
            Only use from the data that is present and relevant to the task at hand. Do not add any external information. 
            Here is the general format you should follow: {format_instructions}. 
            Along with that here are some examples of the format:
            ONLY REPLY WITH THE JSON OBJECT. Dont Include any things such as ```. Just include the Json. For the relevant charts, think of other data the user may want to see\
            example:
                if they are asking about data in one form they may want to see it in another form
                if they are asking about data for one company they may want to see another chart with similar data for another company
                if they are asking about a chart they may also want to see some bullet points/initiatives that are relevant to the data
                they may also want generate some metric that you think would be good to highlight along with the graph
            Task: {task}
            Data: {data} \n \n 
            Object:
            ```json """,
        input_variables=["task", "data"],
        partial_variables={"format_instructions":parser.get_format_instructions()}
    )
    filename = './ImpFiles/data.json'
    os.makedirs(os.path.dirname(filename), exist_ok=True)
    with open(filename, 'r') as f:
        data = json.load(f) 
    llm = getLLM()
    chain = prompt | llm | parser
    ans = chain.invoke({"task":query , "data":data})
    for dp in ans["List_charts"]:
        similar_info = retrieve_info(dp["description"])
        dp["rel_docs"] = similar_info
    return {"type":"screen-update", "content": [ans]}

def generateMatPlotLibCode(query):
    filename = './ImpFiles/data.json'
    os.makedirs(os.path.dirname(filename), exist_ok=True)
    with open(filename, 'r') as f:
        data = json.load(f)

    code = genCode(query, data)    
    for x in range(3):
        works = test_code(code)
        if not works:
            code = reviseCode(query, data, code) 
            works = test_code(code)
        else:
            return {"Status":"Successful", "code":code}
    return {"Status":"Error", "code":code}
    

    knowledge_embeddings = getEmbeddings()
    db = FAISS.load_local(f'faiss_index',knowledge_embeddings, allow_dangerous_deserializations)
    similar_info = retrieve_info(query)
    ## QUERY LLM TO GET MATPLOTLIB CODE
    ## RENDER + RETURN MATPLOTLIB CODE

def reviseCode(query, data, code):
    prompt = PromptTemplate(
        template = "You are a data scientist whose job is to only write matplotlib code given some task and some data. \
        Only use the data from whatever is present, ensuring it is relevant to the question at hand. Do not add any external information. \
        Only include the information in the data provided. \
            Task: {task}. \n Data: {data}. \n \
        You previously created the following code and there was some error in it. Fix the error in the code and please give it back \
         Code:{oldCode} \
         ONLY GIVE ME THE CODE do not include any decorators such as ```python",
        input_variables=["task", "data","oldCode"],
    )
    llm = getLLM(temperature=0.5)
    chain = prompt | llm
    ans = chain.invoke({"task":query , "data":data, "oldCode":code})
    return ans
    
def genCode(query, data):
    prompt = PromptTemplate(
        template = "You are a data scientist whose job is to only write matplotlib code given some task and some data. \
        Only use the data from whatever is present, ensuring it is relevant to the question at hand. Do not add any external information. \
        Only include the information in the data provided. Include any data you need right into the code, I will not touch it at all \
        once the chart is saved save it as './plot.png' \
        For pie charts exclude any data that is less than 0.01% \
            Task: {task}. \n Data: {data}. \n ONLY GIVE ME THE CODE \
            Code: \
            ```python ",
        input_variables=["task", "data"],
    )
    llm = getLLM(temperature=0.5)
    chain = prompt | llm
    ans = chain.invoke({"task":query , "data":data})
    return ans
    
def test_code(code):
    # with open("./temp_code.py", 'w') as f:
    #     f.write(str(code))

    # with open("./temp_code.py", 'r') as f:
    #     content = f.read()
    
    try:
        print(code)
        exec(str(code["content"]))
        print("Code executed successfully")
        return True
    except Exception as e:
        print(f"An error occured at {e}")
        return False

def scrape(path):
    data_points = [GreenBuildingArea, LandsConserved, 
                    WasteDivertedFromLandfill, CO2Avoided, EnergySaved,
                     TotalRenewableCapacity, NewRenewableCapactity, RenewableCapactity]
    data_point_names = ["GreenBuildingArea", "LandsConserved", 
                    "WasteDivertedFromLandfill", "CO2Avoided", "EnergySaved",
                     "TotalRenewableCapacity", "NewRenewableCapactity", "RenewableCapactity"]
    data_prompts = [
                "Review the follwing gathered data return any data relevant to GreenBuildingArea",
                "Review the follwing gathered data return any data relevant to LandsConserved",
                "Review the follwing gathered data return any data relevant to WasteDivertedFromLandfill",
                "Review the follwing gathered data return any data relevant to CO2Avoided",
                "Review the follwing gathered data return any data relevant to EnergySaved",
                "Review the follwing gathered data return any data relevant to TotalRenewableCapacity",
                "Review the follwing gathered data return any data relevant to NewRenewableCapactity",
                "Review the follwing gathered data return any data relevant to RenewableCapactity"]
    comp_json = {}
    for filename in os.listdir(path):
        comp_json[filename] = {}
        file_path = os.path.join(path, filename)
        if os.path.isfile(file_path):
            loader = PyPDFLoader(file_path)
            documents = loader.load()
            chunks = split_documents(documents, chunk_size = 4000, chunk_overlap=0)
            llm = getLLM()
            for idx, data_point in enumerate(data_points):
                query = data_prompts[idx]
                parser = JsonOutputParser(pydantic_object=data_point)
                prompt = PromptTemplate(
                    template = "You are a data gathering LLM who only outputs with a JSON format. Your goal is given a user's query and format instructions, you follow them and pull the correct data \
                    Only use the data provided to you in the prompt Do not add any external information. These are the format instructions: {format_instructions}. Only include the information in the data provided. \
                     If you do not know something then just reply with null if an object is needed or -1 if a float is needed or '' if a string is needed, what datatype is needed is told in the <example_format>.\
                     ONLY REPLY WITH THE JSON OBJECT. Query: {query}. Data: {data}. \n \n Object:\
                     ```json",
                    input_variables=["query", "data"],
                    partial_variables={"format_instructions":parser.get_format_instructions()}
                )
                print(prompt)
                chain = prompt | llm #| parser 

                extractions = chain.batch(
                    [{"query":query, "data":text.page_content} for text in chunks],
                    {"max_concurrency": 10})
                chain = prompt | llm | parser
                ans = chain.invoke({"query":query , "data":extractions})

                try:
                    x = json.loads(parser.parse(json.dump(ans)))
                except:
                    print(ans)
                    prompt = PromptTemplate(
                        template = "You are a data gathering LLM who only outputs with a JSON format. Your goal is given a user's query and format instructions, you follow them and pull the correct data \
                        Only use the data provided to you in the prompt Do not add any external information. These are the format instructions: {format_instructions}. Only include the information in the data provided. \
                        If you do not know something then just reply with null if an object is needed or -1 if a float is needed or '' if a string is needed, what datatype is needed is told in the <example_format>.\
                        ONLY REPLY WITH THE JSON OBJECT. Query: {query}. Data: {data}.</System Prompt> \n \n  Based on the data provided, here is the JSON object. ONLY GIVE ME A JSON OBJECT:\
                        ```json",
                        input_variables=["query", "data"],
                        partial_variables={"format_instructions":parser.get_format_instructions()}
                    )
                    chain = prompt | llm | parser
                    ans = chain.invoke({"query":query , "data":ans})
                # retry_parser = RetryOutputParser.from_llm(parser=parser, llm=llm)
                # ans = new_parser.parse(str(ans))
                # x = retry_parser.parse_with_prompt(ans, query)
                comp_json[filename][data_point_names[idx]] = ans

    filename = './ImpFiles/data.json'
    os.makedirs(os.path.dirname(filename), exist_ok=True)
    with open(filename, 'w') as f:
        json.dump(comp_json, f, indent=4)
    return comp_json


def agent_organizer(query):
    prompt = PromptTemplate(
        template =  """
            Given the user question below, classify it as either being about `Graphs`, `Query`.
            Answer with 'Graphs' if the user is asking you to generate different plots. ex: pie_chart, bar_chart, metric, bullet_point
            Answer with `Query` if the user is asking a general question and not asking for an explicit plot.
            Do not respond with more than one word.
            <question>
            {question}
            </question>

            Classification:""",
        input_variables=["question"]
    )
    llm = getLLM()
    chain = prompt | llm
    ans = chain.invoke({"question":query}).content
    print(ans)
    if(ans == 'Graphs'):
        return generatePlots(query)
    elif(ans == 'Query'):
        return query_model(query)
    else:
        plot_generation_template = """You are a chart generation LLM who given some data and a task. 
            Only use from the data that is present and relevant to the task at hand. Do not add any external information. 
            Here is the general format you should follow: {format_instructions}. 
            Along with that here are some examples of the format:
            ONLY REPLY WITH THE JSON OBJECT. Dont Include any things such as ```. Just include the Json. For the relevant charts, think of other data the user may want to see\
            example:
                if they are asking about data in one form they may want to see it in another form.
                if they are asking about data for one company they may want to see another chart with similar data for another company.
                if they are asking about a chart they may also want to see some bullet points/initiatives that are relevant to the data.
            Task: {task}
            Data: {data} \n \n 
            Object:
            ```json """
        
        query_template = """
            You are a helpful LLM who is there to assist the user and explain any data points. 
            Only use from the data that is present and relevant to the question at hand. Do not add any external information. 
            You will have two datasources. Datasource1 is a JSON object of information scraped for many files, this is the more reliable data.
            Datasource2 is relevant documents taken from a vector database, use this for supplementing information.
            Make sure your answer is too the point and relevant.Just give me the answer directly with some analysis.

            question: {question} \n
            Datasource 1: {data1} \n 
            Datasource 2: {data2} \n \n 
            According to the data provided,"""

        embeddings = getEmbeddings()
        prompt_templates = [plot_generation_template, query_template]
        prompt_embeddings = embeddings.embed_documents(prompt_templates)
        query_vector = embeddings.embed_documents(query)
        similarities = [cosine_similarity([query_vector], [prompt_vector])[0][0] for prompt_vector in prompt_embeddings]
        most_similar_index = np.argmax(similarities)
        if most_similar_index == 0:
            return generatePlots(query)
        else:
            return query_model(query)
    