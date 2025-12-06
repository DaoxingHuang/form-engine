import type { Field } from "@origami/core";
import { FormRunner } from "@origami/editor";
import type { RunnerWidgetMap, RunnerWidgetProps } from "@origami/widgets";
import {
  Button,
  Checkbox,
  DatePicker,
  Input,
  InputNumber,
  Radio,
  Rate,
  Select,
  Slider,
  Switch,
  Upload,
  message
} from "antd";
import type { UploadChangeParam } from "antd/es/upload";
import type { UploadFile } from "antd/es/upload/interface";
import dayjs from "dayjs";
import { CheckCircle, Upload as UploadIcon } from "lucide-react";
import { useState } from "react";

// 1. Define a comprehensive schema covering all field types
const SAMPLE_FIELDS: Field[] = [
  {
    id: "basic_info",
    type: "text",
    title: "基本信息",
    description: "展示基础输入组件",
    disabled: true,
    customClass: "hidden"
  },
  {
    id: "username",
    type: "text",
    title: "用户名",
    required: true,
    placeholder: "请输入用户名",
    description: "自定义 Input 组件"
  },
  {
    id: "bio",
    type: "textarea",
    title: "个人简介",
    placeholder: "请介绍一下自己",
    description: "自定义 TextArea 组件"
  },
  {
    id: "age",
    type: "number",
    title: "年龄",
    required: true,
    minimum: 0,
    maximum: 150,
    description: "自定义 InputNumber 组件"
  },
  {
    id: "role",
    type: "select",
    title: "角色",
    options: [
      { label: "开发者", value: "dev" },
      { label: "设计师", value: "design" },
      { label: "产品经理", value: "pm" }
    ],
    description: "自定义 Select 组件"
  },
  {
    id: "gender",
    type: "radio",
    title: "性别",
    options: [
      { label: "男", value: "male" },
      { label: "女", value: "female" }
    ],
    description: "自定义 Radio 组件"
  },
  {
    id: "skills",
    type: "checkbox",
    title: "技能",
    options: [
      { label: "React", value: "react" },
      { label: "Vue", value: "vue" },
      { label: "Angular", value: "angular" }
    ],
    description: "自定义 Checkbox 组件"
  },
  {
    id: "notifications",
    type: "switch",
    title: "接收通知",
    description: "自定义 Switch 组件"
  },
  {
    id: "birthday",
    type: "date",
    title: "生日",
    description: "自定义 DatePicker 组件"
  },
  {
    id: "experience",
    type: "slider",
    title: "工作年限",
    minimum: 0,
    maximum: 20,
    description: "自定义 Slider 组件"
  },
  {
    id: "satisfaction",
    type: "rate",
    title: "满意度",
    description: "自定义 Rate 组件"
  },
  {
    id: "avatar",
    type: "upload",
    title: "头像",
    description: "自定义 Upload 组件"
  }
];

export default function App() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (data: any) => {
    console.log("Form Data:", data);
    message.success("提交成功！请查看控制台数据");
    setTimeout(() => {
      setSubmitted(true);
    }, 500);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 animate-in fade-in zoom-in duration-300">
        <div className="bg-white p-8 rounded-2xl shadow-xl flex flex-col items-center max-w-md w-full">
          <CheckCircle size={64} className="text-green-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-800">提交成功</h2>
          <p className="text-gray-500 mt-2 text-center">您的信息已成功提交。</p>
          <Button type="primary" onClick={() => setSubmitted(false)} className="mt-8">
            再次填写
          </Button>
        </div>
      </div>
    );
  }

  // 2. Implement Custom Widgets using Ant Design

  const CustomTextWidget = ({ field, value, onChange, error }: RunnerWidgetProps) => (
    <div className="space-y-1">
      <Input
        value={value as string}
        onChange={(e) => onChange(e.target.value)}
        placeholder={field.placeholder}
        disabled={field.disabled}
        status={error ? "error" : ""}
        maxLength={field.maxLength}
        showCount={!!field.maxLength}
      />
    </div>
  );

  const CustomTextAreaWidget = ({ field, value, onChange, error }: RunnerWidgetProps) => (
    <div className="space-y-1">
      <Input.TextArea
        value={value as string}
        onChange={(e) => onChange(e.target.value)}
        placeholder={field.placeholder}
        disabled={field.disabled}
        status={error ? "error" : ""}
        rows={4}
      />
    </div>
  );

  const CustomNumberWidget = ({ field, value, onChange, error }: RunnerWidgetProps) => (
    <div className="space-y-1">
      <InputNumber
        value={value as number}
        onChange={(val) => onChange(val)}
        placeholder={field.placeholder}
        disabled={field.disabled}
        status={error ? "error" : ""}
        min={field.minimum}
        max={field.maximum}
        className="w-full"
      />
    </div>
  );

  const CustomSelectWidget = ({ field, value, onChange, error }: RunnerWidgetProps) => (
    <div className="space-y-1">
      <Select
        value={value}
        onChange={onChange}
        placeholder={field.placeholder || "请选择"}
        disabled={field.disabled}
        status={error ? "error" : ""}
        options={field.options}
        className="w-full"
      />
    </div>
  );

  const CustomRadioWidget = ({ field, value, onChange }: RunnerWidgetProps) => (
    <Radio.Group
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={field.disabled}
      options={field.options}
    />
  );

  const CustomCheckboxWidget = ({ field, value, onChange }: RunnerWidgetProps) => (
    <Checkbox.Group
      value={value as string[]}
      onChange={(vals) => onChange(vals)}
      disabled={field.disabled}
      options={field.options}
    />
  );

  const CustomSwitchWidget = ({ field, value, onChange }: RunnerWidgetProps) => (
    <Switch checked={!!value} onChange={onChange} disabled={field.disabled} />
  );

  const CustomDateWidget = ({ field, value, onChange, error }: RunnerWidgetProps) => (
    <div className="space-y-1">
      <DatePicker
        value={value ? dayjs(value as string) : null}
        onChange={(_, dateString) => onChange(dateString)}
        disabled={field.disabled}
        status={error ? "error" : ""}
        className="w-full"
        showTime
      />
    </div>
  );

  const CustomSliderWidget = ({ field, value, onChange }: RunnerWidgetProps) => (
    <Slider
      value={value as number}
      onChange={(val) => onChange(val)}
      disabled={field.disabled}
      min={field.minimum}
      max={field.maximum}
    />
  );

  const CustomRateWidget = ({ field, value, onChange }: RunnerWidgetProps) => (
    <Rate value={value as number} onChange={onChange} disabled={field.disabled} />
  );

  const CustomUploadWidget = ({ field, value, onChange }: RunnerWidgetProps) => {
    const fileList: UploadFile[] = Array.isArray(value) ? (value as UploadFile[]) : [];

    const handleChange = (info: UploadChangeParam<UploadFile>) => {
      onChange(info.fileList);
    };

    return (
      <Upload
        fileList={fileList}
        listType="picture-card"
        onChange={handleChange}
        disabled={field.disabled}
        multiple={field.multiple}
        maxCount={field.maxFiles}
        beforeUpload={() => false}
      >
        <div className="flex flex-col items-center justify-center text-gray-500">
          <UploadIcon size={16} />
          <div className="mt-1 text-xs">上传</div>
        </div>
      </Upload>
    );
  };

  // 3. Register all custom widgets
  const widgetsOverride: RunnerWidgetMap = {
    text: CustomTextWidget,
    textarea: CustomTextAreaWidget,
    number: CustomNumberWidget,
    select: CustomSelectWidget,
    radio: CustomRadioWidget,
    checkbox: CustomCheckboxWidget,
    switch: CustomSwitchWidget,
    date: CustomDateWidget,
    slider: CustomSliderWidget,
    rate: CustomRateWidget,
    upload: CustomUploadWidget
  };

  return (
    <div className="h-screen overflow-y-auto bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100">
        <div className="bg-indigo-600 px-8 py-6 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-white">Ant Design 自定义组件示例</h1>
            <p className="text-indigo-100 mt-2 text-sm opacity-90">
              演示如何使用 Ant Design 组件完全接管 FormRunner 的渲染
            </p>
          </div>
        </div>
        <FormRunner fields={SAMPLE_FIELDS} onSubmit={handleSubmit} widgetsOverride={widgetsOverride} />
      </div>
    </div>
  );
}
