import React, { useState, useEffect } from "react";
import { useEmailStore } from "../store/emailStore";
import { useAuthStore } from "../store/authStore";
import toast from "react-hot-toast";

const EmailPg = () => {
  const {
    getCategories,
    categories,
    emails,
    getEmails,
    addCategory,
    removeCategory,
    addEmail,
    removeEmail,
  } = useEmailStore();
  const { authUser } = useAuthStore();

  const [what, setWhat] = useState("category");
  const [currentCategory, setCurrentCategory] = useState(null);
  const [it, setIt] = useState("");
  const [render, setRender] = useState(false);
  const [inputValue, setInputValue] = useState("");

  // Form states for adding an email
  const [emailData, setEmailData] = useState({ name: "", mail: "" });

  useEffect(() => {
    const fetchCat = async () => {
      await getCategories();
    };
    fetchCat();
  }, []);

  const handleAction = async () => {
    if (it === "add" && inputValue.trim() !== "") {
      await addCategory(inputValue);
    } else if (it === "remove" && inputValue.trim() !== "") {
      // Remove category after clicking "Okay"
      await handleRemoveCategory(inputValue.trim());
    }
    setRender(false); // Close input field
    setIt(""); // Reset action
    setInputValue(""); // Clear input value
  };

  const handleCategoryClick = async (category) => {
    setCurrentCategory(category);
    await getEmails(category._id);
    setWhat("list"); // Switch to email display
  };

  const handleAddEmail = async () => {
    const { name, mail } = emailData;

    if (!name.trim() || !mail.trim()) {
      toast.error("Name and Email are required.");
      return;
    }

    try {
      await addEmail(currentCategory._id, emailData);
      setEmailData({ name: "", mail: "" }); // Clear form
      toast.success("Email added successfully.");
    } catch (error) {
      toast.error("Failed to add email.");
    }
  };

  const handleRemoveEmail = async (emailId) => {
    try {
      await removeEmail(currentCategory._id, emailId);
    } catch (error) {
      console.error("Failed to remove email:", error);
    }
  };

  const handleRemoveCategory = async (categoryName) => {
    const category = categories.find(cat => cat.name === categoryName);
    if (category) {
      try {
        await removeCategory(category._id);
        toast.success("Category removed successfully.");
      } catch (error) {
        toast.error("Failed to remove category.");
      }
    } else {
      toast.error("Category not found.");
    }
  };

  const goBack = () => {
    if (what === "list") {
      setWhat("category"); // Go back to category display
    }
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value); // Update input value as the user types
  };

  return (
    <div className="m-8">
      {/* Back Button */}
      {what === "list" && (
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

          {/* Add/Remove Input */}
          {render && it === "add" && (
            <div className="fixed right-4 bottom-48">
              <input
                type="text"
                className="input input-bordered w-full pl-10"
                placeholder="Add Category"
                value={inputValue}
                onChange={handleInputChange} // Update input value
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
                onChange={handleInputChange} // Update input value
              />
            </div>
          )}
        </>
      )}

      {/* Email List Section */}
      {what === "list" && (
        <>
          <div className="grid gap-8">
            {emails.map((email, index) => (
              <div
                className="card outline outline-primary text-primary text-2xl justify-center items-center font-bold flex hover:bg-primary hover:text-black"
                key={index}
              >
                <div className="card-body">
                  <div>{email.name}</div>
                  <div>{email.mail}</div>
                </div>
                {authUser.isAdmin && (
                  <button
                    className="btn btn-outline btn-error text-sm"
                    onClick={() => handleRemoveEmail(email._id)}
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Add Email Section */}
          {authUser.isAdmin && (
            <div className="mt-10">
              <h3 className="text-2xl font-bold mb-4">Add Email</h3>
              <div className="flex gap-4">
                <input
                  type="text"
                  className="input input-bordered w-full"
                  placeholder="Name Surname"
                  value={emailData.name}
                  onChange={(e) =>
                    setEmailData((prev) => ({ ...prev, name: e.target.value }))
                  }
                />
                <input
                  type="email"
                  className="input input-bordered w-full"
                  placeholder="xyz@email.com"
                  value={emailData.mail}
                  onChange={(e) =>
                    setEmailData((prev) => ({ ...prev, mail: e.target.value }))
                  }
                />
                <button
                  className="btn btn-outline btn-primary"
                  onClick={handleAddEmail}
                >
                  Add
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default EmailPg;
