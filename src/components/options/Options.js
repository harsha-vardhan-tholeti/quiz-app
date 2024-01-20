import React from "react";

function Options({ question, dispatch, answer }) {
  const hasAnswered = answer !== null;

  return (
    <div className="options">
      {question.options.map((option, index) => (
        <button
          className={`btn btn-option ${index === answer ? "answer" : ""} ${
            hasAnswered
              ? index === question.correctOption
                ? "correct"
                : "wrong"
              : ""
          }`}
          key={index}
          disabled={hasAnswered}
          onClick={() => dispatch({ type: "NEW_ANSWER", payload: index })}
        >
          {option}
        </button>
      ))}
    </div>
  );
}

export default Options;
