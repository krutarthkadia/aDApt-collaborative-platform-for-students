import React, { useRef, useState } from "react";
import { Image, Send, X } from "lucide-react";
import toast from "react-hot-toast";
import imageCompression from "browser-image-compression"; // Import image compression library
import { useQnAStore } from "../store/QnAStore";

const AnswerInput = ({ questionId, category }) => {
    const [text, setText] = useState("");
    const [file, setFile] = useState(null);
    const [filePreview, setFilePreview] = useState(null);
    const fileInputRef = useRef(null);
    const { sendAnswer, setQId } = useQnAStore();

    const handleFileChange = async (e) => {
        const uploadedFile = e.target.files[0];
        if (!uploadedFile) return;

        if (!uploadedFile.type.startsWith("image/")) {
            toast.error("Please select a valid image file");
            return;
        }

        try {
            const options = {
                maxSizeMB: 0.5, // Compress to a max size of 0.5 MB
                maxWidthOrHeight: 600, // Resize dimensions
                useWebWorker: true,
            };

            const compressedFile = await imageCompression(uploadedFile, options);

            setFile(compressedFile);
            setFilePreview(URL.createObjectURL(compressedFile)); // Preview compressed image
        } catch (error) {
            console.error("Error compressing image:", error);
            toast.error("Failed to compress image");
        }
    };

    const removeFile = () => {
        setFile(null);
        setFilePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleSendAnswer = async (e) => {
        e.preventDefault(); // Stop the default form submission

        // Prevent submission if no text or file is provided
        if (!text.trim() && !file) {
            toast.error("Please provide text or attach a file.");
            return;
        }

        // Prevent submission if no questionId is available
        if (!questionId) {
            toast.error("No question selected!");
            return;
        }

        setQId(questionId)
        console.log("I'm called")
        try {
            const formData = {
                questionId,
                text: text.trim(),
                file: file ? await toBase64(file) : null, // Convert file to Base64
            };

            await sendAnswer(category, formData);

            // Clear form after submission
            setText("");
            removeFile();
            toast.success("Answer sent successfully!");
        } catch (error) {
            console.error("Failed to send answer:", error);
            toast.error("Failed to send answer.");
        }
    };

    // Utility function to convert file to Base64
    const toBase64 = (file) =>
        new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result.split(",")[1]); // Extract Base64 string
            reader.onerror = (error) => reject(error);
        });

    return (
        <div className="p-4 w-full">
            {/* File Preview */}
            {filePreview && (
                <div className="mb-3 flex items-center gap-2">
                    <div className="relative">
                        <img
                            src={filePreview}
                            alt="Preview"
                            className="w-20 h-20 object-cover rounded-lg border border-zinc-700"
                        />
                        <button
                            onClick={removeFile}
                            className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-base-300 flex items-center justify-center"
                            type="button"
                        >
                            <X className="size-3" />
                        </button>
                    </div>
                </div>
            )}

            <form onSubmit={handleSendAnswer} className="flex items-center gap-2">
                <div className="flex-1 flex gap-2">
                    {/* Text Input */}
                    <input
                        type="text"
                        className="w-full input input-bordered rounded-lg input-sm sm:input-md"
                        placeholder="Type your answer..."
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                    />
                    
                    {/* File Input */}
                    <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                    />
                    
                    {/* File Upload Button */}
                    <button
                        type="button"
                        className={`hidden sm:flex btn btn-circle ${file ? "text-emerald-500" : "text-zinc-400"}`}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <Image size={20} />
                    </button>
                </div>
                
                {/* Submit Button */}
                <button
                    type="submit"
                    className="btn btn-sm btn-circle"
                    disabled={!text.trim() && !file} // Disable if no text or file
                >
                    <Send size={22} />
                </button>
            </form>
        </div>
    );
};

export default AnswerInput;
