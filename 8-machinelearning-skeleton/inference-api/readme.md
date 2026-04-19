Given a machine learning model stored to a file with joblib, we can create a container that runs a server and uses the model to make predictions. This will contain the code for our inference API.

There are three files to the folder: `app.py`, `requirements.txt`, and `Dockerfile`. The app.py file will contain the code for the API, the requirements.txt file is used to specify the Python dependencies for the project, and the `Dockerfile` will contain the instructions to build the container.

## Install these Python libraries for building web applications and machine learning models. 

The fastapi library is used to create the web API, `joblib` is used to load the machine learning model, `pandas` is used for data manipulation, `scikit-learn` is used for machine learning, and `uvicorn` is used as the ASGI server to run the FastAPI application.

## The inference API

- POST /inference-api/predict takes a JSON object in the form { "exercise": number, "code": "string" } and returns a JSON object with the property prediction that has a numeric value.

- POST /inference-api/train that takes a JSON object in the form [{ "exercise": number, "code": "string" }, { "exercise": number, "code": "string" }, ...], trains a model using the input data, replacing the model with the newly trained model. When the training is finished, the endpoint should return a JSON document with the property status that has the text "Model trained successfully".

## Client-side functionality that uses the inference API

You can POST data to the training endpoint of the inference API, which allows you to quickly train the model with new data.

- When the user is is typing a solution to an exercise, the application asks for predictions from the inference API.
- The client has a timer that is reset whenever the user types in content to the textarea. If the user stops typing for more than 500 milliseconds, the application should ask for a prediction from the inference API and show the prediction to the user.
- The timer should start only when the user start typing, not before the first keypress.
- The prediction in a text paragraph that has the text "Correctness estimate:", which is followed by the prediction. 
- If the inference API returns a JSON document that looks as follows: {"prediction: 32.2}, the text shown in the paragraph should be "Correctness estimate: 32%".