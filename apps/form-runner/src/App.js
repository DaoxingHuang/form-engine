import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { FormRunner } from "@chameleon/default-widgets";
import { CheckCircle } from "lucide-react";
import { useState } from "react";
// Sample schema for demonstration
const SAMPLE_FIELDS = [
    {
        id: "name",
        type: "text",
        title: "姓名",
        required: true,
        placeholder: "请输入姓名"
    },
    {
        id: "age",
        type: "number",
        title: "年龄",
        required: true
    },
    {
        id: "gender",
        type: "radio",
        title: "性别",
        options: [
            { label: "男", value: "male" },
            { label: "女", value: "female" }
        ]
    },
    {
        id: "avatar",
        type: "upload",
        title: "头像",
        description: "请上传您的头像"
    },
    {
        id: "contract",
        type: "upload",
        title: "合同文件",
        description: "请上传相关合同文件 (PDF/Word)"
    }
];
export default function App() {
    const [submitted, setSubmitted] = useState(false);
    const handleSubmit = (data) => {
        console.log("Form Data:", data);
        // Simulate API call
        setTimeout(() => {
            setSubmitted(true);
        }, 500);
    };
    if (submitted) {
        return (_jsx("div", { className: "min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 animate-in fade-in zoom-in duration-300", children: _jsxs("div", { className: "bg-white p-8 rounded-2xl shadow-xl flex flex-col items-center max-w-md w-full", children: [_jsx(CheckCircle, { size: 64, className: "text-green-500 mb-4" }), _jsx("h2", { className: "text-2xl font-bold text-gray-800", children: "\u63D0\u4EA4\u6210\u529F" }), _jsx("p", { className: "text-gray-500 mt-2 text-center", children: "\u60A8\u7684\u4FE1\u606F\u5DF2\u6210\u529F\u63D0\u4EA4\uFF0C\u611F\u8C22\u60A8\u7684\u914D\u5408\u3002" }), _jsx("button", { onClick: () => setSubmitted(false), className: "mt-8 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors", children: "\u518D\u6B21\u586B\u5199" })] }) }));
    }
    return (_jsx("div", { className: "h-screen overflow-y-auto bg-gray-50 py-8 px-4", children: _jsxs("div", { className: "max-w-2xl mx-auto bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100", children: [_jsx("div", { className: "bg-indigo-600 px-8 py-6 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] flex justify-between items-start", children: _jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold text-white", children: "\u4FE1\u606F\u6536\u96C6\u8868" }), _jsx("p", { className: "text-indigo-100 mt-2 text-sm opacity-90", children: "\u8BF7\u4ED4\u7EC6\u586B\u5199\u4EE5\u4E0B\u4FE1\u606F" })] }) }), _jsx(FormRunner, { fields: SAMPLE_FIELDS, onSubmit: handleSubmit })] }) }));
}
