# This is the Backend for T-Hack Mafia in the TIAA Summer Intern Hackathon

## Structure
The backend is divided into multiple microservices. Each microservice will have its own Docker file.

## Dependency Management

### Why Use Poetry?

Poetry automatically manages the creation and management of virtual environments for python projects along with all their dependencies. This provides the following benefits:

1. **Dependency Resolution**: Automatically handles complex dependency trees, ensuring compatibility.

2. **Reproducible Builds**: Creates consistent environments across different systems using `poetry.lock`.

3. **Isolated Environments**: Each project gets its own virtual environment, preventing conflicts between projects.

4. **Easy Package Management**: Simple commands for adding, updating, or removing packages.

5. **Project Scaffolding**: Quickly sets up new Python projects with a standardized structure.

By using Poetry, we can streamline our development process, enhance collaboration, and maintain a clean, reproducible project environment.

### Installing up Poetry
We are using poetry for venv/dependency management with our python microservices
1. Using pip
    
    ```python
    pip install poetry
    ```

- To create a new poetry project: `poetry new project_name`

### Dependencies in poetry
- To install all dependencies in a poetry project: `poetry install`
- To add packages to a poetry project: `poetry add <package>`
- To remove a package from a poetry project: `poetry remove <package>`

### Running programs with poetry
- To run a python file just use `poetry run python script.py`
- For cli tools like fastapi, you can use `poetry run fastapi` followed by the regular arguments you would use with fastapi

### Understanding Poetry and VS Code Integration

Poetry creates isolated virtual environments for each project, typically in a centralized location on your computer. This can lead to VS Code showing import warnings if it's using your global Python environment instead of the one created by poetry.

### Resolving Import Warnings

These warnings don't affect program execution when run with Poetry, but they can be resolved for a better development experience.

### Steps to Configure VS Code for Poetry

1. Naviate to your Poetry project in the terminal.

2. Find your project's Poetry environment path: `poetry env info --path`

3. In VS Code, press `Ctrl+Shift+P` (or `Cmd+Shift+P` on macOS) to open the Command Palette.

4. Type "Python: Select Interpreter" and select "Enter interpreter path..." 

5. Paste the path obtained from step 2 into the input box.

VS Code will now use the Poetry environment, resolving import warnings and providing accurate IntelliSense for that project's dependencies.

**Note**: These steps must be repeated each time you switch to a different project. But again, these warnings won't matter as long as the code is executed with poetry.