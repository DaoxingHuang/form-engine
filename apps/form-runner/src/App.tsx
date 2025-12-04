import { FormRunner } from "@chameleon/default-widgets";
import { Field } from "@chameleon/engine-core";

// Sample schema for demonstration
const SAMPLE_FIELDS: Field[] = [
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
  }
];

export default function App() {
  const handleSubmit = (data: any) => {
    console.log("Form Data:", data);
    alert("Form Submitted! Check console.");
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Form Runner Demo</h1>
        <FormRunner fields={SAMPLE_FIELDS} onSubmit={handleSubmit} />
      </div>
    </div>
  );
}
