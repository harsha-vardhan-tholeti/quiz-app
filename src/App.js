import { useEffect, useReducer } from "react";
import "./App.css";
import Header from "./components/header/Header";
import Main from "./components/main/Main";
import Loader from "./components/loader/Loader";
import Error from "./components/error/Error";
import StartScreen from "./components/start-screen/StartScreen";
import Question from "./components/question/Question";
import NextButton from "./components/next-button/NextButton";
import Progress from "./components/progress/Progress";
import FinishScreen from "./components/finish-screen/FinishScreen";
import Footer from "./components/footer/Footer";
import Timer from "./components/timer/Timer";

const SECS_PER_QUESTION = 30;

const initialState = {
  questions: [],
  // 'loading', 'error', 'ready', 'active', 'finished'
  status: "loading",
  index: 0,
  answer: null,
  points: 0,
  highScore: 0,
  secondsRemaining: null,
};

function reducer(state, action) {
  switch (action.type) {
    case "DATA_RECEIVED":
      return {
        ...state,
        questions: action.payload,
        status: "ready",
      };
    case "DATA_FAILED":
      return {
        ...state,
        status: "error",
      };
    case "START":
      return {
        ...state,
        status: "active",
        secondsRemaining: state.questions.length * SECS_PER_QUESTION,
      };
    case "NEW_ANSWER":
      const question = state.questions.at(state.index);
      return {
        ...state,
        answer: action.payload,
        points:
          action.payload === question.correctOption
            ? state.points + question.points
            : state.points,
      };
    case "NEXT_QUESTION":
      return {
        ...state,
        index: state.index + 1,
        answer: null,
      };
    case "FINISHED":
      return {
        ...state,
        status: "finished",
        highScore:
          state.points > state.highScore ? state.points : state.highScore,
      };
    case "RESTART":
      return {
        ...initialState,
        questions: state.questions,
        status: "ready",
      };
    case "TICK":
      return {
        ...state,
        secondsRemaining: state.secondsRemaining - 1,
        status: state.secondsRemaining === 0 ? "finished" : state.status,
      };
    default:
      throw new Error("Action Unknown");
  }
}

function App() {
  const [
    { questions, status, index, answer, points, highScore, secondsRemaining },
    dispatch,
  ] = useReducer(reducer, initialState);

  const numQuestions = questions.length;
  const maxPossiblePoints = questions.reduce(
    (prev, curr) => prev + curr.points,
    0
  );

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await fetch("http://localhost:8000/questions");
        const data = await res.json();
        dispatch({ type: "DATA_RECEIVED", payload: data });
      } catch (error) {
        dispatch({ type: "DATA_FAILED" });
      }
    };
    fetchQuestions();
  }, []);

  return (
    <div className="app">
      <Header />
      <Main>
        {status === "loading" && <Loader />}
        {status === "error" && <Error />}
        {status === "ready" && (
          <StartScreen numQuestions={numQuestions} dispatch={dispatch} />
        )}
        {status === "active" && (
          <>
            <Progress
              index={index}
              numQuestions={numQuestions}
              points={points}
              maxPossiblePoints={maxPossiblePoints}
              answer={answer}
            />
            <Question
              question={questions[index]}
              dispatch={dispatch}
              answer={answer}
            />
            <Footer>
              <Timer dispatch={dispatch} secondsRemaining={secondsRemaining} />
              <NextButton
                dispatch={dispatch}
                answer={answer}
                index={index}
                numQuestions={numQuestions}
              />
            </Footer>
          </>
        )}
        {status === "finished" && (
          <FinishScreen
            dispatch={dispatch}
            points={points}
            maxPossiblePoints={maxPossiblePoints}
            highScore={highScore}
          />
        )}
      </Main>
    </div>
  );
}

export default App;
