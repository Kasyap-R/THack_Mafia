from langchain_core.pydantic_v1 import BaseModel, Field
from typing import List, Optional, Union, Literal

class GreenBuildingArea(BaseModel):
    area_sq_meters: Optional[float] = Field(..., description="Total Area in square meters of green buildings")
    number_of_buildings: Optional[int] = Field(..., description="Total number of green buildings")
    financial_allocation: Optional[int] = Field(..., description="How much money went into the green buildings")
    innovative_featuers: Optional[List[str]] = Field(..., description="a list of innovative Features to do with their green buildings")

class LandsConserved(BaseModel):
    area_hectares: Optional[float] = Field(..., description="Total area in hectares of lands conserved")
    location: Optional[str] = Field(..., description="Location of the conserved Lands")
    financial_allocation: Optional[int] = Field(..., description="How much money went into conserving lands")


class WasteDivertedFromLandfill(BaseModel):
    waste_tonnes: Optional[float] = Field(..., description="Total waste in tonnes diverted from landfill")
    financial_allocation: Optional[int] = Field(..., description="How much money went into diverting waste from landfill")

class CO2Avoided(BaseModel):
    co2_tonnes: Optional[float] = Field(..., description="Total CO2 in tonnes avoided")
    financial_allocation: Optional[int] = Field(..., description="How much money went into avoiding CO2")

class EnergySaved(BaseModel):
    energy_mwh: Optional[float] = Field(..., description="Total Energy Saved in megawatt hours (MwH)")
    # financial_allocation: Optional[int] = Field(..., description="How much money went into conserving energy")

class TotalRenewableCapacity(BaseModel):
    capacity_mw: Optional[float] = Field(..., description="Total Renewable Energy Capacity Saved in megawatt hours (MwH)")
    # financial_allocation: Optional[int] = Field(..., description="How much money went into Total Renewable Energy Capacity")

class NewRenewableCapactity(BaseModel):
    new_capacity_mw: Optional[float] = Field(..., description="New renewable energy capacity in megawatt (Mw)")
    # financial_allocation: Optional[int] = Field(..., description="How much money went into New renewable energy capacity")

class RenewableCapactity(BaseModel):
    generation_mwh: Optional[float] = Field(..., description="Total renewable energy generation in megawatt hours")
    financial_allocation: Optional[int] = Field(..., description="How much money went into Total renewable energy capacity")


class Comparative_Chart(BaseModel):
    type_of_chart: Literal["pie_chart", "bar_chart", "metric", "bullet_point", "no_chart"] = Field(..., description="What type of chart is asked for. This can only be one of the constrained values listed.")
    title: str = Field(..., description="An Appropriate Title for what the Chart is showing")
    values: Union[int, List[int]] = Field(..., description="A list of the different values going into the chart. These indexes should match with the indexes in the labels array ")
    labels: Union[str, List[str]] = Field(..., description="A list of the different labels going into the chart. These indexes should match with the indexes in the values array. This can be")
    description: str = Field(..., description="A description of what the chart is using. Make this short")
    is_percent: Literal[True, False] = Field(..., description="Whether or not the values in the chart are percentage values or not")

class List_of_charts(BaseModel):
    List_charts: List[Comparative_Chart] = Field(..., description="4 related Comparative Chart Objects that are all relevant to the question and data")