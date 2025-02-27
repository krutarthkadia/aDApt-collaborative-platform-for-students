import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useQnAStore } from "../store/QnAStore";
import { FilePlus2, FileX2 } from "lucide-react";
import questionMarkImage from "../assets/question_mark.jpg";
import AnswerInput from "../components/AnswerInput";
import { useAuthStore } from "../store/authStore";

const QnAPg = () => {
  const {
    getCategories,
    addCategory,
    removeCategory,
    getAnswers,
    sendQuestion,
    sendAnswer,
    getQuestions,
    categories,
    setCategories,
    setQuestions,
    setAnswers,
    questions,
    answers,
    connectSocket,
    dissconnectSocket,
  } = useQnAStore();
  const { authUser, socket } = useAuthStore();

  const [it, setIt] = useState("");
  const [render, setRender] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [selectedQuestionId, setSelectedQuestionId] = useState(null);
  const [selectedImg, setSelectedImg] = useState(null);
  const [selectedText, setSelectedText] = useState(null);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [what, setWhat] = useState("category"); // Control the visible section

  useEffect(() => {
    const fetchCat = async () => {
      await getCategories();
    };
    fetchCat();
  }, []);

  // Connect socket when the component mounts and disconnect when unmounted
  useEffect(() => {
    connectSocket();
    return () => dissconnectSocket();
  }, [connectSocket, dissconnectSocket]);

  const handleAction = async () => {
    if (it === "add" && inputValue.trim() !== "") {
      await addCategory(inputValue);
    } else if (it === "remove" && inputValue.trim() !== "") {
      await removeCategory(inputValue);
    }
    setRender(false); // Close input field
    setIt(""); // Reset action
    setInputValue(""); // Clear input value
  };

  const handleCategoryClick = async (category) => {
    setCurrentCategory(category);
    await getQuestions(category);
    setWhat("qna"); // Switch to question display
  };

  const handleQuestionClick = async (questionId, img, content) => {
    setSelectedQuestionId(questionId);
    setSelectedImg(img);
    setSelectedText(content);
    await getAnswers(currentCategory, questionId);
    setWhat("chat"); // Switch to chat view
  };

  const goBack = () => {
    if (what === "chat") {
      setWhat("qna"); // Go back to question display
    } else if (what === "qna") {
      setWhat("category"); // Go back to category selection
    }
  };

  const truncateText = (text, length) => {
    if (text.length > length) {
      return text.substring(0, length) + "...";
    }
    return text;
  };

  return (
    <div className="m-4">
      {/* Back Button */}
      {what === "qna" && (
        <button
          className="btn btn-outline btn-primary fixed bottom-5 text-xl"
          onClick={goBack}
        >
          Back
        </button>
      )}

      {what === "chat" && (
        <button
          className="btn btn-outline btn-primary fixed z-10 right-4 text-xl"
          onClick={goBack}
        >
          Back
        </button>
      )}

      {/* Category Section */}
      {what === "category" && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-7 xl:grid-cols-8 gap-4">
            {categories.map((category, index) => (
              <div
                className="card outline outline-primary text-primary text-2xl justify-center items-center font-bold flex hover:bg-primary hover:text-black"
                key={index}
                onClick={() => handleCategoryClick(category)}
              >
                <div className="card-body">{category}</div>
              </div>
            ))}
          </div>
          {/* Edit Dropdown */}
          <div className="dropdown dropdown-top dropdown-end fixed right-4 bottom-4">
            {!render ? (
              <div
                tabIndex={0}
                role="button"
                className={`text-xl btn btn-outline btn-primary m-1 ${
                  !authUser.isAdmin ? "btn-disabled" : ""
                }`}
                onClick={() => authUser.isAdmin && setRender(true)} // Only allow setting render when isAdmin is true
              >
                Edit
              </div>
            ) : (
              <div
                tabIndex={0}
                role="button"
                className={`text-xl btn btn-outline btn-success m-1 ${
                  !authUser.isAdmin ? "btn-disabled" : ""
                }`}
                onClick={authUser.isAdmin ? handleAction : undefined} // Only allow action when isAdmin is true
              >
                Okay
              </div>
            )}
            {authUser.isAdmin && (
              <ul
                tabIndex={0}
                className="dropdown-content menu text-xl text-black bg-primary rounded-box z-[1] w-52 p-2 m-1 shadow"
              >
                <li>
                  <a onClick={() => setIt("add")}>Add</a>
                </li>
                <li>
                  <a onClick={() => setIt("remove")}>Remove</a>
                </li>
              </ul>
            )}
          </div>

          {/* /* Add/Remove Input */}
          {render && it === "add" && (
            <div className="fixed right-4 bottom-48">
              <input
                type="text"
                className="input input-bordered w-full pl-10"
                placeholder="Add Category"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
            </div>
          )}
          {render && it === "remove" && (
            <div className="fixed right-4 bottom-48">
              <input
                type="text"
                className="input input-bordered w-full pl-10"
                placeholder="Remove Category"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
            </div>
          )}
        </>
      )}

      {/* Question Display Section */}
      {what === "qna" && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 my-6 mx-2">
            {questions.map((question) => (
              <div
                className="card outline outline-primary outline-2 shadow-2xl flex flex-col m-2 hover:bg-primary hover:text-black transition-colors"
                key={question._id || question.text}
                onClick={() =>
                  handleQuestionClick(question._id, question.file, question.text)
                }
              >
                <figure>
                  <img src={question.file || questionMarkImage} alt="Question" />
                </figure>
                <div className="card-body text-xl">
                  <p>{truncateText(question.text, 50)}</p>
                </div>
              </div>
            ))}
          </div>
          <div
            tabIndex={0}
            role="button"
            className="text-xl fixed right-4 bottom-4 btn btn-outline btn-primary m-1"
          >
            <Link to="/qna_upload" className="text-xl">
              Add
            </Link>
          </div>
        </>
      )}

      {/* Chat Section */}
      {what === "chat" && (
        <>
          <div className="flex justify-center items-center w-full">
            <div className="card bg-base-100 w-full shadow-xl p-4 m-4">
              <figure>
                <img
                  className="sm:max-w-[500px]"
                  src={selectedImg || questionMarkImage}
                  alt="Selected Question"
                />
              </figure>
              <div className="card-body text-2xl">
                <p>{selectedText}</p>
              </div>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {answers.map((answer, index) => (
              <div
                className={
                  authUser._id === answer.senderId
                    ? "chat chat-start"
                    : "chat chat-end"
                }
                key={answer._id || index}
              >
                <div className="chat-image avatar">
                  <div className="size-10 rounded-full border">
                    <img
                      src={"https://via.placeholder.com/150"}
                      alt="Avatar"
                    />
                  </div>
                </div>

                <div className="chat-bubble flex flex-col">
                  {answer.file && (
                    <img
                      src={answer.file || "https://via.placeholder.com/150"}
                      alt="Content"
                      className="sm:max-w-[200px] rounded-md mb-2"
                    />
                  )}
                  <p className="text-xl">
                    {answer.text || "No content available."}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <AnswerInput questionId={selectedQuestionId} category={currentCategory} />
        </>
      )}
    </div>
  );
};

export default QnAPg;