import React, { useState, useRef } from 'react';
import { MessageCircleQuestion, Image, X, ClipboardList } from 'lucide-react';
import { useLnFStore } from '../store/LnFStore.js';
import toast from 'react-hot-toast';
import imageCompression from 'browser-image-compression'; // Import image compression library

const LnFForm = () => {
    const { sendLostMessage, sendFoundMessage } = useLnFStore();
    const [text, setText] = useState('');
    const [file, setFile] = useState(null);
    const [type, setType] = useState('')
    const fileInputRef = useRef(null);
    const [place, setPlace] = useState("");

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (!file || !file.type.startsWith('image/')) {
            toast.error('Please select a valid image file');
            return;
        }

        try {
            const options = {
                maxSizeMB: 0.5, // Reduce file size to 0.5 MB
                maxWidthOrHeight: 600, // Smaller dimensions
                useWebWorker: true,
            };

            const compressedFile = await imageCompression(file, options);
            setFile(compressedFile); // Save compressed file directly
        } catch (error) {
            console.error('Error compressing image:', error);
            toast.error('Failed to compress image');
        }
    };

    const removeImage = () => {
        setFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const toBase64 = (file) =>
        new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file); // Converts file to Base64 with MIME type
            reader.onload = () => resolve(reader.result.split(',')[1]); // Extract only Base64 content
            reader.onerror = (error) => reject(error);
        });
    

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!place.trim() || (!text.trim() && !file)) {
            toast.error('Please provide a category and either a description or a file');
            return;
        }

        try {
            console.log(text.trim())
            console.log(file)
            const formData = {
                text: text.trim(),
                file: file ? await toBase64(file) : null, // Convert file to Base64
            };

            if (type === 'Lost') await sendLostMessage(place.trim(), formData);
            if (type === 'Found') await sendFoundMessage(place.trim(), formData);

            // Clear form
            setText('');
            setPlace('');
            setFile(null);
            setType('');
            if (fileInputRef.current) fileInputRef.current.value = '';
        } catch (error) {
            console.error('Failed to send message:', error);
        }
    };




    return (
        <div className="mt-10 mx-4 outline outline-primary rounded-lg">
            <form onSubmit={handleSubmit}>
                <div className="relative py-4 m-4 text-xl">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <ClipboardList className="size-5 text-base-content/40" />
                    </div>
                    <input
                        type="text"
                        className="input input-bordered w-full pl-10"
                        placeholder="Place"
                        value={place}
                        onChange={(e) => setPlace(e.target.value)}
                    />
                </div>

                <div className="relative py-4 m-4 text-xl">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MessageCircleQuestion className="size-5 text-base-content/40" />
                    </div>
                    <input
                        type="text"
                        className="input input-bordered w-full pl-10"
                        placeholder="Item Description"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                    />
                </div>

                <div className="relative py-4 m-4 text-xl">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MessageCircleQuestion className="size-5 text-base-content/40" />
                    </div>
                    <input
                        type="text"
                        className="input input-bordered w-full pl-10"
                        placeholder="Lost or Found"
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                    />
                </div>

                {/* Image Preview Section */}
                {file && (
                    <div className="mb-3 flex items-center gap-2 px-4">
                        <div className="relative">
                            <img
                                src={URL.createObjectURL(file)}
                                alt="Preview"
                                className="w-20 h-20 object-cover rounded-lg border border-zinc-700"
                            />
                            <button
                                type="button"
                                onClick={removeImage}
                                className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-base-300 flex items-center justify-center"
                            >
                                <X className="size-3" />
                            </button>
                        </div>
                    </div>
                )}

                {/* File Upload Input */}
                <div className="flex items-center justify-center w-full px-4 pb-4">
                    <label
                        htmlFor="dropzone-file"
                        className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500"
                    >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <Image className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" />
                            <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                                <span className="font-semibold">Click to upload</span> or drag and drop
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                SVG, PNG, JPG or GIF (MAX. 800x400px)
                            </p>
                        </div>
                        <input
                            id="dropzone-file"
                            type="file"
                            className="hidden"
                            ref={fileInputRef}
                            onChange={handleImageChange}
                        />
                    </label>
                </div>

                {/* Submit Button */}
                <button type="submit" className="btn btn-outline btn-primary m-4">
                    Submit
                </button>
            </form>
        </div>
    );
};

export default LnFForm;
