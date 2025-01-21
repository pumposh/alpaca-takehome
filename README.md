# Alpaca Health Software Engineering Take-Home Project

### Project Description

Visit this link for details:
[https://harviio.notion.site/Alpaca-Health-Eng-Take-home-Project-1411bfc50b90803382d4cae01f9bcf18?pvs=4](https://www.notion.so/harviio/ABA-Session-Note-Generator-Take-Home-Project-1411bfc50b90803382d4cae01f9bcf18?pvs=4)

## Setup Instructions

### Backend Setup (Python 3.11+ required)

```bash
# Create and activate virtual environment
python -m venv alpaca_venv
source alpaca_venv/bin/activate  # or `venv\Scripts\activate` on Windows

# Install dependencies
pip install -r requirements.txt

# Start the server
fastapi dev main.py
```

### Frontend Setup (Node.js 18+ required)

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The application will be available at:

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

## Default Project Structure

- `frontend/`: Next.js application
  - `src/components/`: Reusable React components
  - `src/app/`: Next.js app router pages
- `backend/`: FastAPI application
  - `app/main.py`: API endpoints

## Development

- Frontend runs on port 3000 with hot reload enabled
- Backend runs on port 8000 with auto-reload enabled
- API documentation available at http://localhost:8000/docs

## Submission

1. Create a private GitHub repository
2. Implement your solution
3. Document any assumptions or trade-offs
4. Include instructions for running your solution
5. Send us the repository link

## Time Expectation

- Expected time: 3-4 hours
- Please don't spend more than 6 hours

## Evaluation Criteria

| Category | Details | Weight |
|----------|---------|--------|
| Product sense and scoping | - Final product decisions alignment with requirements<br>- Appropriate deprioritization of non-crucial parts | 10% |
| Technology selection | - Right tools chosen for the job | 10% |
| Technical Level | - Well-organized and intuitive code structure<br>- Modular code (e.g., React components used)<br>- Proper use of React hooks<br>- Good state management<br>- Correct use of useEffect hooks | 40% |
| Craft and Quality | - Usable and intuitive UI/UX<br>- Presence and severity of bugs | 20% |
| Documentation | - Clear communication of logic and technical decisions in README | 10% |
| Testing | - Presence of tests<br>- Quality and robustness of tests | 10% |


## Development Analysis
### Approach and challenge
To move as quickly as possible, my IDE Cursor's composition tooling came in handy for quickly defining and structuring overarching functionality. Although I've kept closely up to date with the development in its tech, it's been quite some time since I've worked with React hands-on so this came in handy to quickly deliver working implementations. When it came to architectural decisions as well as specific enhancements, I was in full control of the processes and could make the best decisions for the project. 
    
In an ideal world, I'd have spent more low level implementation time to ensure that the application was exceptionally well structured and modular.

### Design decisions
On an architectural side, for the interest of time, I opted to use the browser's standard indexDB to store sessions, notes, and settings. This allowed me to quickly implement the functionality I needed without having to worry about a persistent backend and instead focus on specifics such as the specificity of the AI prompt engineering and the UI/UX of interacting with the note intake.

For the prompt engineering, I opted to use the OpenAI API to generate the notes mainly because I have previous experience setting up requests via OpenAI. I also chose to use the GPT-4 since the specificity of the application would benefit from the robustness of the model.

It seemed like a strange architecural decision for the project to be split into a frontend in Next.js and a backend in FastAPI since the power of Next.js is the lack of separation between a frontend and backend; however, since the technical work on the backend was relatively minimal, consolidation of the two was clearly out of scope for the project.

It was a bit out of scope to implment a full fledged optimized note editing system, but I did implement a basic system that allowed for the editing and deletion of the input notes. This included navigating between specific notes with arrow keys, pressing e to edit a note, backspace/delete to delete a note, enter/tab to save the note, and cmd/ctrl+enter to regenerate the optimization.

Additionally, I'd have liked to implement a fully responsive UI, but it was out of scope to support UI variations.

### Assumptions
I assumed that the application would be run in a modern browser that supports the IndexedDB API.

### Sources
I used the following sources to help me with the project:
  - [OpenAI API Documentation](https://platform.openai.com/docs/api-reference/introduction)
  - [Next.js Documentation](https://nextjs.org/docs)
  - [FastAPI Documentation](https://fastapi.tiangolo.com/docs/)
