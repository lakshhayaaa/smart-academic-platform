from pydantic import BaseModel, EmailStr

class SignUpRequest(BaseModel):
    roll_no:str
    name: str
    email: EmailStr
    password: str
    regulation_year: int

class SignInRequest(BaseModel):
    email: EmailStr
    password: str

class SignUpResponse(BaseModel):
    #response will be a json message saying "Account created successfully"
    message: str

class SignInResponse(BaseModel):
    #response will be a json message saying "Login successful" and an access token
    message: str
    access_token: str

class SignOutResponse(BaseModel):
    #response will be a json message saying "Logout successful"
    message: str