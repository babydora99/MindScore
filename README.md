# 🧠 Mental Health Score Predictor

An interactive Machine Learning web application that predicts a user's mental health score based on social media usage, academic activities, and lifestyle habits.

The application uses a trained Machine Learning model integrated with a FastAPI backend to generate predictions based on user-provided information.

## 🌐 Live Demo

**[🚀 View Live Application](https://mindscore-1-kgpt.onrender.com/)**

**Backend API:** [View API](https://mindscore-iryu.onrender.com/)

**API Documentation:** [Swagger UI](https://mindscore-iryu.onrender.com/docs)


## 📌 Project Overview

Mental health is influenced by several factors, including social media consumption, sleep patterns, physical activity, academic workload, and stress levels.

This project aims to explore the relationship between these lifestyle factors and mental health using Machine Learning.

Users can enter their personal, social media, and lifestyle information through an interactive web interface. The application sends the data to a FastAPI backend, where a trained Machine Learning model processes the input and predicts a mental health score.

## ✨ Features

- **Interactive User Interface:** Modern, responsive, and user-friendly web application.
- **Mental Health Score Prediction:** Predicts mental health scores using a trained Machine Learning model.
- **Personal Information Analysis:** Considers age, gender, country, and academic level.
- **Social Media Usage Analysis:** Evaluates frequently used platforms, usage hours, daily unlocks, and purpose of use.
- **Lifestyle Analysis:** Considers study hours, physical activity, sleep duration, and stress levels.
- **FastAPI Integration:** Connects the frontend with the trained ML model through REST API endpoints.
- **Input Validation:** Validates user inputs using Pydantic.
- **Real-Time Results:** Displays the predicted score after successful API processing.
- **Responsive Design:** Supports desktop, tablet, and mobile devices.

## 🛠️ Technology Stack

| Category | Technologies |
|---|---|
| Frontend | HTML5, CSS3, JavaScript |
| Backend | Python, FastAPI |
| Machine Learning | Scikit-learn, Random Forest Regressor |
| Data Processing | Pandas, NumPy |
| Model Persistence | Joblib |
| Data Validation | Pydantic |
| API Communication | REST API, Fetch API |
| Development Tools | VS Code, Git, GitHub |

## ⚙️ How It Works

1. **User Input:** Users provide personal information, social media usage patterns, and lifestyle details.
2. **Input Validation:** The FastAPI backend validates the submitted information using Pydantic.
3. **Data Processing:** The input data is converted into a Pandas DataFrame with the required features.
4. **ML Prediction:** The pre-trained Machine Learning model processes the input and generates a prediction.
5. **Result Display:** The predicted mental health score is returned through the API and displayed on the frontend.

## 📊 Input Features

The prediction model uses the following features:

| Feature | Description |
|---|---|
| Age | User's age |
| Gender | Male or Female |
| Country | User's country |
| Academic Level | Undergraduate, Graduate, or High School |
| Most Used Platform | Frequently used social media platform |
| Purpose of Use | Primary reason for using social media |
| Average Daily Usage Hours | Daily social media usage duration |
| Daily Unlocks | Number of daily phone unlocks |
| Study Hours | Daily study duration |
| Physical Activity Hours | Daily physical activity duration |
| Sleep Hours Per Night | Average nightly sleep duration |
| Stress Level | Self-reported stress level |

## 🔌 API Endpoints

The application uses the following FastAPI endpoints:

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Returns the API welcome message |
| POST | `/predict` | Accepts user information and returns the predicted mental health score |

### Sample API Request

```json
{
  "age": 21,
  "gender": "Male",
  "country": "India",
  "academic_level": "Undergraduate",
  "most_used_platform": "Instagram",
  "purpose_of_use": "Entertainment",
  "avg_daily_usage_hours": 5.5,
  "daily_unlocks": 45,
  "study_hours": 4.0,
  "physical_activity_hours": 1.0,
  "sleep_hours_per_night": 7.0,
  "stress_level": "Medium"
}
```

### Sample API Response

```json
{
  "predicted_mental_health_score": 7.25
}
```

*The response above is an illustrative example, not a guaranteed prediction.*

Install dependencies:

```bash
pip install -r requirements.txt
```

**Important:** Use the same Scikit-learn version used during model training to maintain model compatibility.

### Start the FastAPI Server

```bash
uvicorn main:app --reload
```

The backend will run at:

```text
http://127.0.0.1:8000
```

Access interactive API documentation:

```text
http://127.0.0.1:8000/docs
```

### Run the Frontend

Open the `frontend` folder in VS Code.

Run `index.html` using the Live Server extension or another local HTTP server.

Make sure the API base URL in `script.js` points to your running FastAPI backend.


## ⚠️ Disclaimer

This application is developed for educational and learning purposes. The predicted mental health score is an estimate generated by a Machine Learning model based on patterns in the training data.

It is not a clinical assessment, medical diagnosis, or substitute for professional mental health advice.

## 👩‍💻 Author

**V Baby Dora**

- GitHub: [@babydora99](https://github.com/babydora99)


