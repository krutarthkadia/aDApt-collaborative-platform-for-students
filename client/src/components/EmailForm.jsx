import React, { useState, useRef } from 'react';
import { MessageCircleQuestion, Image, X, ClipboardList, Mail } from 'lucide-react';
import { useEmailStore } from '../store/emailStore.js';
import toast from 'react-hot-toast';
import imageCompression from 'browser-image-compression'; // Import image compression library

const EmailForm = () => {
    const { addEmail } = useEmailStore();
    const [mail, setMail] = useState('');
    const [name, setName] = useState('')
    const [category, setCategory] = useState("");


    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!name.trim() || (!mail.trim()) || (!category.trim())) {
            toast.error('Please provide a category and either a description or a file');
            return;
        }

        try {
            const formData = {
                mail: mail.trim(),
                name: name.trim(),
            };
            await addEmail(category.trim(), formData)
            // Clear form
            setMail('');
            setCategory('');
            setName('');
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
                        placeholder="Category"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                    />
                </div>

                <div className="relative py-4 m-4 text-xl">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="size-5 text-base-content/40" />
                    </div>
                    <input
                        type="text"
                        className="input input-bordered w-full pl-10"
                        placeholder="xyz@email.com"
                        value={mail}
                        onChange={(e) => setMail(e.target.value)}
                    />
                </div>

                <div className="relative py-4 m-4 text-xl">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MessageCircleQuestion className="size-5 text-base-content/40" />
                    </div>
                    <input
                        type="text"
                        className="input input-bordered w-full pl-10"
                        placeholder="Name Surname"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </div>

                {/* Submit Button */}
                <button type="submit" className="btn btn-outline btn-primary m-4">
                    Submit
                </button>
            </form>
        </div>
    );
};

export default EmailForm;
