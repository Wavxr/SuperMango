# 🥭 SuperMango

SuperMango is a mobile application that helps mango farmers detect the **risk and severity of anthracnose disease** in mango leaves using **image classification and real-time weather data**. By combining leaf image analysis with GPS-based weather inputs, SuperMango delivers actionable recommendations to mitigate crop loss — all in the palm of your hand.

---

## 🧠 Tech Stack

### 🌐 Frontend
- [React Native](https://reactnative.dev/) using [Expo](https://expo.dev/)
- Expo Router (file-based navigation)
- Camera and Location APIs
- Axios for HTTP requests

### 🔧 Backend
- [FastAPI](https://fastapi.tiangolo.com/) (Python)
- ResNet50 (PyTorch) for severity classification
- Random Forest (scikit-learn) for risk prediction
- Rule-based system for treatment recommendations

---

## 🚀 Installation & Setup

### ✅ Backend

1. Navigate to the backend folder:
   ```bash
   cd Backend
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Run the FastAPI server:
   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

---

### ✅ Frontend

1. Navigate to the frontend folder:
   ```bash
   cd Frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the Expo development server:
   ```bash
   npx expo start
   ```

> Make sure your phone and backend server are on the same Wi-Fi network for API access.

---

## 👨‍🔬 Research Contributors

This project was developed as part of an undergraduate thesis by:

- **Autonomoux** – BS Computer Science – FEU Tech
  - Rolen Christoper Paradeza
  - [Add other members here]

Supervised by: *[Insert adviser’s name]*

---

## 📖 Open Source & Credits

This project is open source under the **MIT License**.  
We acknowledge the use of:

- ResNet50 (PyTorch)
- OpenWeatherMap API
- Data insights adapted from scholarly research on *Colletotrichum gloeosporioides* and mango anthracnose

---

> “Bringing AI-powered disease detection to the farm — no microscope required.”