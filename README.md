# ultFMT — Developer Utilities for the AI Era 🚀

> Modern, fast, and privacy-friendly tools tailored specifically for AI engineers, researchers, and developers.

![ultFMT Preview](https://via.placeholder.com/1200x600.png?text=ultFMT+-+Developer+Utilities+for+the+AI+Era)

**[Live Website](https://ultfmt.com)** | **[Report an Issue](https://github.com/SahilChukka19/ultFMT/issues/new)** | **[Submit a Tool Idea](https://github.com/SahilChukka19/ultFMT/issues/new)**

---

## 🛡️ Core Philosophy

AI engineers deal with highly sensitive data daily—proprietary prompts, confidential datasets, and private API keys. Most web-based utilities store this data, require sign-ups, or run opaque tracking scripts.

**ultFMT is built differently:**
- **Zero Data Retention:** Data uploaded for analysis is processed entirely in RAM and immediately garbage-collected. We don't use databases to store your inputs.
- **No Accounts Required:** No logins, no friction. Just open the tool and get to work.
- **Privacy First:** We don't collect, store, or ask for your API keys. Period.

## 🛠️ The Tool Suite

### 📊 ML Studio
Tools for exploring, debugging, and visualizing machine learning datasets and training runs.
- **Dataset Health:** Instantly check CSV datasets for missing values, class imbalances, and duplicate rows before training.
- **Feature Intelligence:** Calculate correlation matrices, mutual information, and PCA components to identify the strongest predictors in your dataset.
- **Learning Curve Plotter:** A pure client-side charting tool to visualize training vs. validation loss/accuracy from CSV logs to spot overfitting instantly.

### ✍️ Prompt Tools
Utilities to debug and optimize complex LLM prompts.
- **Token Estimator:** Estimate token counts across different tokenizers (OpenAI `cl100k_base`, Anthropic, etc.) without making expensive API calls.
- **Prompt Diff:** A visual side-by-side diff tool to track exactly what changed between two prompt versions.
- **Context Checker:** Verify if your prompt + document payload fits within specific model context windows.

### 🤖 MCP Studio
Tools for building and configuring Model Context Protocol (MCP) agents.
- **Visual Builder:** Drag-and-drop interface to build complex multi-agent MCP configurations.
- **MCP Validator:** Static analysis tool to ensure your MCP JSON configurations are valid, have correct environment variables, and don't contain conflicting scopes.

## 💻 Tech Stack

- **Frontend:** Next.js (App Router), React, Tailwind CSS, Lucide Icons, Recharts
- **Backend:** FastAPI, Python, Pandas, Scikit-learn
- **State/Storage:** Purely in-memory (RAM), LocalStorage for UI preferences

## 🚀 Local Development

Want to run ultFMT locally or contribute a new tool? 

### Prerequisites
- Node.js (v18+)
- Python (3.10+)

### 1. Setup the Backend (FastAPI)
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: .\venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```
The backend API will run on `http://localhost:8000`.

### 2. Setup the Frontend (Next.js)
In a new terminal tab:
```bash
cd frontend
npm install
npm run dev
```
The frontend will be available at `http://localhost:3000`.

## 🤝 Contributing

We welcome contributions! If you have an idea for a lightweight, highly-focused tool that AI engineers need, we'd love to see it.
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingTool`)
3. Commit your changes (`git commit -m 'Add some AmazingTool'`)
4. Push to the branch (`git push origin feature/AmazingTool`)
5. Open a Pull Request

## 📄 License

This project is open-source and available under the [MIT License](LICENSE). 

---
*Built for the deep-focus developer.*
