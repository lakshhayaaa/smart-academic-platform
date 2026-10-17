
from pydantic import BaseModel, Field, ConfigDict, field_validator


class UnitRegistration(BaseModel):
    unit_number: int = Field(ge=1)
    unit_name: str = Field(min_length=1, max_length=150)

    @field_validator("unit_name")
    @classmethod
    def validate_unit_name(cls, value: str) -> str:
        value = value.strip()

        if not value:
            raise ValueError("Unit name cannot be empty")

        return value


class CourseRegistrationRequest(BaseModel):
    course_code: str = Field(min_length=1, max_length=30)
    course_name: str = Field(min_length=1, max_length=150)
    department_code: str = Field(min_length=1, max_length=10)
    regulation_year: int = Field(ge=1, le=9999)
    semester_number: int = Field(ge=1)
    units: list[UnitRegistration] = Field(min_length=1)

    @field_validator(
        "course_code",
        "course_name",
        "department_code",
    )
    @classmethod
    def strip_text(cls, value: str) -> str:
        value = value.strip()

        if not value:
            raise ValueError("This field cannot be empty")

        return value

    @field_validator("units")
    @classmethod
    def validate_unique_units(
        cls, units: list[UnitRegistration]
    ) -> list[UnitRegistration]:
        numbers = [unit.unit_number for unit in units]

        if len(numbers) != len(set(numbers)):
            raise ValueError("Unit numbers must be unique")

        return units


class CourseRegistrationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    course_code: str
    course_name: str
    department_code: str
    regulation_year: int
    semester_number: int
