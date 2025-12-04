import { jsx as _jsx } from "react/jsx-runtime";
import FormBuilder from "./FormBuilder";
export default function App() {
    const handlePublish = (schema) => {
        console.log("Published Schema:", schema);
        alert("Schema Published! Check console.");
    };
    return (_jsx("div", { className: "h-screen w-screen bg-gray-50 overflow-hidden", children: _jsx(FormBuilder, { onPublish: handlePublish }) }));
}
