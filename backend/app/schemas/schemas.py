from datetime import datetime
from typing import Optional, Dict, Any, List

from pydantic import BaseModel, EmailStr, Field


# Base User Schema
class UserBase(BaseModel):
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    is_active: Optional[bool] = True
    is_superuser: Optional[bool] = False


class UserCreate(UserBase):
    email: EmailStr
    password: str


class UserUpdate(UserBase):
    password: Optional[str] = None


# Base API Credential Schema
class APICredentialBase(BaseModel):
    provider: str
    api_key: str
    is_active: bool = True


class APICredentialCreate(APICredentialBase):
    pass


class APICredentialUpdate(APICredentialBase):
    provider: Optional[str] = None
    api_key: Optional[str] = None
    is_active: Optional[bool] = None


# Base Chart Schema
class ChartBase(BaseModel):
    title: str
    description: Optional[str] = None
    query: str
    natural_language_query: str
    provider: str
    data: Dict[str, Any]
    vega_spec: Dict[str, Any]
    is_public: bool = False


class ChartCreate(ChartBase):
    pass


class ChartUpdate(ChartBase):
    title: Optional[str] = None
    description: Optional[str] = None
    query: Optional[str] = None
    natural_language_query: Optional[str] = None
    provider: Optional[str] = None
    data: Optional[Dict[str, Any]] = None
    vega_spec: Optional[Dict[str, Any]] = None
    is_public: Optional[bool] = None


# Base Dashboard Schema
class DashboardBase(BaseModel):
    title: str
    description: Optional[str] = None
    layout: Optional[Dict[str, Any]] = None
    is_public: bool = False


class DashboardCreate(DashboardBase):
    pass


class DashboardUpdate(DashboardBase):
    title: Optional[str] = None
    description: Optional[str] = None
    layout: Optional[Dict[str, Any]] = None
    is_public: Optional[bool] = None


# Base DashboardChart Schema
class DashboardChartBase(BaseModel):
    dashboard_id: int
    chart_id: int
    position_x: int = 0
    position_y: int = 0
    width: int = 4
    height: int = 4


class DashboardChartCreate(DashboardChartBase):
    pass


class DashboardChartUpdate(DashboardChartBase):
    position_x: Optional[int] = None
    position_y: Optional[int] = None
    width: Optional[int] = None
    height: Optional[int] = None


# Token Schema
class Token(BaseModel):
    access_token: str
    token_type: str


class TokenPayload(BaseModel):
    sub: Optional[str] = None


# Response Models with Additional Info
class UserInDBBase(UserBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class UserInDB(UserInDBBase):
    hashed_password: str


class User(UserInDBBase):
    pass


class APICredentialInDBBase(APICredentialBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class APICredential(APICredentialInDBBase):
    pass


class ChartInDBBase(ChartBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class Chart(ChartInDBBase):
    pass


class DashboardInDBBase(DashboardBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class Dashboard(DashboardInDBBase):
    pass


class DashboardChartInDBBase(DashboardChartBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class DashboardChart(DashboardChartInDBBase):
    pass


# Natural Language Query Schema
class NaturalLanguageQuery(BaseModel):
    query: str
    provider: str = "flipside"


# Query Result Schema
class QueryResult(BaseModel):
    data: List[Dict[str, Any]]
    query: str
    vega_spec: Dict[str, Any]
