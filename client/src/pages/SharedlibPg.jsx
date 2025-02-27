import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSharedLibStore } from "../store/sharedlibStore";
import { FilePlus2, FileX2 } from "lucide-react";
import questionMarkImage from "../assets/question_mark.jpg";
import AnswerInput from "../components/AnswerInput";
import { useAuthStore } from "../store/authStore";

const SharedlibPg = () => {
  const {
    categories,
    courses,
    files,
    getCategories,
    getCourses,
    getFiles,
    addCategory,
    removeCategory,
    addCourse,
    removeCourse,
    catId,
    setCatId,
    csId,
    setCsId,
    removeFile
  } = useSharedLibStore();
  const { authUser } = useAuthStore();

  const [it, setIt] = useState("");
  const [render, setRender] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [currentCategory, setCurrentCategory] = useState(null);
  const [what, setWhat] = useState("category"); // Control the visible section

  useEffect(() => {
    const fetchCat = async () => {
      await getCategories();
    };
    fetchCat();
  }, []);

  const handleActionCat = async () => {
    if (it === "add" && inputValue.trim() !== "") {
      await addCategory(inputValue);
    } else if (it === "remove" && inputValue.trim() !== "") {
      await removeCategory(inputValue);
    }
    setRender(false); // Close input field
    setIt(""); // Reset action
    setInputValue(""); // Clear input value
  };

  const handleActionCourse = async () => {
    if (it === "add" && inputValue.trim() !== "") {
      await addCourse(currentCategory.category, { name: inputValue });
    } else if (it === "remove" && inputValue.trim() !== "") {
      console.log(currentCategory.category)
      console.log(inputValue)
      await removeCourse(currentCategory.category, inputValue);
    }
    setRender(false); // Close input field
    setIt(""); // Reset action
    setInputValue(""); // Clear input value
  };

  const handleCategoryClick = async (category) => {
    setCurrentCategory(category)
    setCatId(category._id);
    console.log(category.category)
    await getCourses(category.category);
    setWhat("course"); // Switch to question display
  };

  const handleActionFile = async () => {
    
      await removeFile(catId, csId, inputValue);
    
    setRender(false); // Close input field
    setIt(""); // Reset action
    setInputValue(""); // Clear input value
  };

  const handleCourseClick = async (category) => {
    console.log(catId);
    setCsId(category._id)
    console.log(category._id); // Logs the selected ID
    await getFiles(catId, category._id); // Use category._id here
    setWhat("file"); // Switch to question display
  };



  const goBack = () => {
    if (what === "file") {
      setWhat("course"); // Go back to question display
    } else if (what === "course") {
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
    <div className="m-8">
      {/* Back Button */}
      {(what === "file" || what === "course") && (
        <button
          className="btn btn-outline btn-primary fixed bottom-5 text-xl"
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
                <div className="card-body">{category.category}</div>
              </div>
            ))}
          </div>
          {/* Edit Dropdown */}
          <div className="dropdown dropdown-top dropdown-end fixed right-4 bottom-4">
            {!render ? (
              <div
                tabIndex={0}
                role="button"
                className={`text-xl btn btn-outline btn-primary m-1 ${!authUser.isAdmin ? "btn-disabled" : ""
                  }`}
                onClick={() => authUser.isAdmin && setRender(true)} // Only allow setting render when isAdmin is true
              >
                Edit
              </div>
            ) : (
              <div
                tabIndex={0}
                role="button"
                className={`text-xl btn btn-outline btn-success m-1 ${!authUser.isAdmin ? "btn-disabled" : ""
                  }`}
                onClick={authUser.isAdmin ? handleActionCat : undefined} // Only allow action when isAdmin is true
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

          {/* Add/Remove Input */}
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

      {/* Category Section */}
      {what === "course" && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-7 xl:grid-cols-8 gap-4">
            {courses.map((category, index) => (
              <div
                className="card outline outline-primary text-primary text-2xl justify-center items-center font-bold flex hover:bg-primary hover:text-black"
                key={index}
                onClick={() => handleCourseClick(category)}
              >
                <div className="card-body">{category.name}</div>
              </div>
            ))}
          </div>
          {/* Edit Dropdown */}
          <div className="dropdown dropdown-top dropdown-end fixed right-4 bottom-4">
            {!render ? (
              <div
                tabIndex={0}
                role="button"
                className={`text-xl btn btn-outline btn-primary m-1 ${!authUser.isAdmin ? "btn-disabled" : ""
                  }`}
                onClick={() => authUser.isAdmin && setRender(true)} // Only allow setting render when isAdmin is true
              >
                Edit
              </div>
            ) : (
              <div
                tabIndex={0}
                role="button"
                className={`text-xl btn btn-outline btn-success m-1 ${!authUser.isAdmin ? "btn-disabled" : ""
                  }`}
                onClick={authUser.isAdmin ? handleActionCourse : undefined} // Only allow action when isAdmin is true
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

          {/* Add/Remove Input */}
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

      {/* File Section */}
      {what === "file" && (
        <>
          <div className="grid gap-8">
            {files.map((file, index) => (
              <div
                className="card outline outline-primary text-primary text-2xl justify-center items-center font-bold flex hover:bg-primary hover:text-black cursor-pointer"
                key={index}
                onClick={() => window.open(file.url, "_blank")} // Open file in a new tab/window
              >
                <div className="card-body">
                  <div>{file.name}</div>
                </div>
              </div>
            ))}
          </div>
          <div
            tabIndex={0}
            role="button"
            className="text-xl fixed right-4 bottom-4 btn btn-outline btn-primary m-1"
          >
            <Link to="/file_upload" className="text-xl">
              Add
            </Link>
          </div>
          {/* Remove File Button */}
          <div>
            {!render ? (
              <div
                tabIndex={0}
                role="button"
                className={`text-xl btn btn-outline btn-danger fixed right-28 bottom-4 m-1 ${!authUser.isAdmin ? "btn-disabled" : ""}`}
                onClick={() => authUser.isAdmin && setRender(true)}
              >
                Remove
              </div>
            ) : (
              <div
                tabIndex={0}
                role="button"
                className={`text-xl btn btn-outline btn-success fixed right-28 bottom-4 m-1 ${!authUser.isAdmin ? "btn-disabled" : ""}`}
                onClick={authUser.isAdmin ? handleActionFile : undefined}
              >
                Okay
              </div>
            )}
            {render  && (
              <div className="fixed right-4 bottom-20">
                <input
                  type="text"
                  className="input input-bordered w-full pl-10"
                  placeholder="Enter File Name"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                />
              </div>
            )}
          </div>
        </>
      )}

    </div>
  );
};

export default SharedlibPg;
