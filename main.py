from fastapi import FastAPI 
import joblib
from pydantic import BaseModel,Field
import pandas as pd 
from typing import Literal
from fastapi.middleware.cors import CORSMiddleware #CORS(cors origin resource sharing) middleware to allow cross-origin requests
model=joblib.load('Mental_Health_Model.pkl') # load the trainied model

app=FastAPI() # create an instance of fastAPI

app.add_middleware(
  CORSMiddleware,
  allow_origins=['*'],
  allow_methods=['*'],
  allow_headers=['*']
)

top_countries=['Other','India','USA','Canada','Australia','UK','Germany','Mexico','Turkey','France']

#create a pydantic model to validate the input data
class StudentData(BaseModel):
  age                         : int=Field(...,gt=0,lt=100)
  gender                      : Literal['Male',"Female"]
  country                     : str
  academic_level              : Literal['Undergraduate', 'Graduate', 'High School']
  most_used_platform          : Literal['Facebook', 'LinkedIn', 'Instagram', 'Snapchat', 'Twitter','YouTube', 'TikTok', 'LINE', 'KakaoTalk', 'VKontakte', 'WhatsApp','WeChat']
  purpose_of_use              : Literal['Networking', 'Education', 'Entertainment', 'News']
  avg_daily_usage_hours       : float=Field(...,gt=0,lt=24)
  daily_unlocks               : int=Field(...,gt=0)
  study_hours                 : float=Field(...,gt=0,lt=24)
  physical_activity_hours     : float =Field(gt=0,lt=24)
  sleep_hours_per_night       : float=Field(...,gt=0,lt=24)
  stress_level                : Literal['Medium', 'Low', 'Very High', 'High']
    
#Response back
class PredictionResponse(BaseModel):
  predicted_mental_health_score: float

@app.get('/') #create a route fot the home page
def read_root():
  return("Message : Welcome to the Mental Health Prediction API. Please use the /predict endpoint to get predictions based on your input data.")

@app.post('/predict', response_model=PredictionResponse)
def predict(data:StudentData):
  
  country_group=data.country if data.country in top_countries else 'Other'
  
  input_row=pd.DataFrame([{ #input fields for the model prediction
    'Age': data.age,
    'Gender': data.gender,
    'Country': data.country,
    'Academic_Level': data.academic_level,
    'Most_Used_Platform': data.most_used_platform,
    'Purpose_Of_Use': data.purpose_of_use,
    'Avg_Daily_Usage_Hours': data.avg_daily_usage_hours,
    'Daily_Unlocks': data.daily_unlocks,
    'Study_Hours': data.study_hours,
    'Physical_Activity_Hours': data.physical_activity_hours,
    'Sleep_Hours_Per_Night': data.sleep_hours_per_night,
    'Stress_Level': data.stress_level,
    'Grouped_country': country_group
  }])
  prediction=model.predict(input_row)[0]    
  return PredictionResponse(predicted_mental_health_score=round(float(prediction), 2))
  