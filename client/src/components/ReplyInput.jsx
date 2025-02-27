import React, { useRef, useState } from "react";
import { Image, Send, X } from "lucide-react";
import toast from "react-hot-toast";
import imageCompression from "browser-image-compression"; // Import image compression library
import { useLnFStore } from "../store/LnFStore";

const ReplyInput = ({ msgId, place }) => {
    const [text, setText] = useState("");
    const [file, setFile] = useState(null);
    const [filePreview, setFilePreview] = useState(null);
    const fileInputRef = useRef(null);
    const { sendReply, setQId } = useLnFStore();

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

    const toBase64 = (file) =>
        new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file); // Converts file to Base64 with MIME type
            reader.onload = () => resolve(reader.result.split(',')[1]); // Extract only Base64 content
            reader.onerror = (error) => reject(error);
        });

    const handleSendReply = async (e) => {
        e.preventDefault(); // Stop the default form submission

        // Prevent submission if no text or file is provided
        if (!text.trim() && !file) {
            toast.error("Please provide text or attach a file.");
            return;
        }

        // Prevent submission if no msgId is available
        if (!msgId) {
            toast.error("No question selected!");
            return;
        }
        setQId(msgId)
        console.log("I'm called")
        try {
            const formData = {
                msgId,
                text: text.trim(),
                file: file ? await toBase64(file) : null, // Convert file to Base64
            };

            await sendReply(place, formData);

            // Clear form after submission
            setText("");
            removeFile();
            toast.success("Reply sent successfully!");
        } catch (error) {
            console.error("Failed to send answer:", error);
            toast.error("Failed to send answer.");
        }
    };


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

            <form onSubmit={handleSendReply} className="flex items-center gap-2">
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

export default ReplyInput;
