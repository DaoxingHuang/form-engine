import { initializeApp } from 'firebase/app';
import {
    getAuth,
    onAuthStateChanged,
    signInAnonymously,
    signInWithCustomToken
} from 'firebase/auth';
import {
    addDoc,
    collection, doc,
    getDoc,
    getFirestore,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp,
    setDoc
} from 'firebase/firestore';
import {
    AlertCircle,
    AlertTriangle,
    ArrowLeft,
    Calendar,
    CheckCircle,
    CheckSquare,
    CircleDot,
    ClipboardList,
    Code,
    Database,
    Edit2,
    Eye,
    FileCheck,
    FileJson,
    FileText,
    Fingerprint,
    Hash,
    Image as ImageIcon,
    Import,
    Layout,
    List,
    MonitorPlay,
    Play,
    Plus,
    RefreshCw,
    Save,
    Server,
    Settings,
    Sliders, Star,
    Tag,
    ToggleLeft,
    Trash2,
    Type,
    Upload,
    User,
    X
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

// --- Firebase 初始化 ---
const firebaseConfig = JSON.parse(__firebase_config);
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

// --- 常量定义 ---
const FORM_ID = "demo_dynamic_form_v13"; 

// 常用正则预设
const REGEX_PRESETS = [
  { label: '自定义', value: '', msg: '' },
  { label: '手机号 (中国)', value: '^1[3-9]\\d{9}$', msg: '请输入正确的11位手机号' },
  { label: '电子邮箱', value: '^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$', msg: '请输入有效的邮箱地址' },
  { label: '身份证号', value: '(^\\d{15}$)|(^\\d{18}$)|(^\\d{17}(\\d|X|x)$)', msg: '身份证格式不正确' },
];

const COMPONENT_TYPES = [
  { type: 'text', label: '单行文本', icon: 'Aa', group: 'basic' },
  { type: 'textarea', label: '多行文本', icon: '¶', group: 'basic' },
  { type: 'number', label: '数字输入', icon: '#', group: 'basic' },
  { type: 'select', label: '下拉选择', icon: '▼', group: 'select' },
  { type: 'radio', label: '单选框', icon: <CircleDot size={16}/>, group: 'select' },
  { type: 'checkbox', label: '多选框', icon: <CheckSquare size={16}/>, group: 'select' },
  { type: 'switch', label: '开关', icon: <ToggleLeft size={16}/>, group: 'select' },
  { type: 'date', label: '日期时间', icon: '📅', group: 'advanced' },
  { type: 'slider', label: '滑块', icon: <Sliders size={16}/>, group: 'advanced' },
  { type: 'rate', label: '评分', icon: <Star size={16}/>, group: 'advanced' },
  { type: 'upload', label: '文件/图片', icon: <Upload size={16}/>, group: 'advanced' },
  { type: 'array', label: '对象列表', icon: <List size={16}/>, group: 'layout' },
];

const SUB_FIELD_TYPES = [
  { type: 'text', label: '文本', icon: <Type size={14}/> },
  { type: 'number', label: '数字', icon: <Hash size={14}/> },
  { type: 'date', label: '日期', icon: <Calendar size={14}/> },
  { type: 'select', label: '下拉', icon: '▼' },
  { type: 'radio', label: '单选', icon: <CircleDot size={14}/> },
  { type: 'switch', label: '开关', icon: <ToggleLeft size={14}/> },
  { type: 'upload', label: '上传', icon: <Upload size={14}/> },
];

const TARGET_SYSTEMS = ['CRM系统 (A)', '营销中台 (B)', '客服系统 (C)'];

// --- 辅助工具函数：Schema 反向解析 ---
const parseSchemaToFields = (schema) => {
  if (!schema || !schema.properties) return [];
  const properties = schema.properties;
  const requiredList = schema.required || [];
  
  return Object.keys(properties).map(key => {
    const prop = properties[key];
    const isArray = prop.type === 'array';
    
    let options = undefined;
    if (prop.enum) {
       options = prop.enum.map((val, i) => ({ value: val, label: (prop.enumNames && prop.enumNames[i]) ? prop.enumNames[i] : val }));
    } else if (prop.items && prop.items.enum) {
       options = prop.items.enum.map((val, i) => ({ value: val, label: (prop.items.enumNames && prop.items.enumNames[i]) ? prop.items.enumNames[i] : val }));
    }

    let subFields = [];
    if (isArray && prop.items && prop.items.type === 'object' && prop.items.properties) {
        subFields = parseSchemaToFields(prop.items); 
    }

    return {
      id: key,
      title: prop.title || key,
      type: prop.uiWidget || (isArray ? 'array' : prop.type === 'number' ? 'number' : prop.type === 'boolean' ? 'switch' : 'text'),
      description: prop.description || '',
      placeholder: prop.placeholder || '',
      required: requiredList.includes(key),
      options: options,
      minimum: prop.minimum,
      maximum: prop.maximum,
      minLength: prop.minLength,
      maxLength: prop.maxLength,
      validationRegex: prop.pattern,
      errorMsg: prop.errorMessage,
      // --- Upload Config (Only strict business logic constraints) ---
      accept: prop.accept,
      maxFileSize: prop.maxFileSize,
      subFields: subFields
    };
  });
};

// --- 辅助组件 ---
const Button = ({ children, onClick, variant = 'primary', className = '', disabled = false, icon: Icon, size='md', type = 'button' }) => {
  const baseStyle = "rounded-lg font-medium transition-all flex items-center justify-center gap-2";
  const sizeStyles = { sm: "px-2 py-1 text-xs", md: "px-4 py-2 text-sm", lg: "px-6 py-3 text-base" };
  const variants = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm disabled:bg-indigo-300",
    secondary: "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 disabled:bg-gray-100",
    danger: "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100",
    ghost: "bg-transparent text-gray-600 hover:bg-gray-100"
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`${baseStyle} ${sizeStyles[size]} ${variants[variant]} ${className}`}>
      {Icon && <Icon size={size === 'sm' ? 14 : 16} />} {children}
    </button>
  );
};

const OptionsEditor = ({ options, onChange }) => {
  const addOption = () => { onChange([...(options || []), { label: '新选项', value: `opt_${Date.now()}` }]); };
  const updateOption = (idx, key, val) => { const newOpts = [...options]; newOpts[idx][key] = val; onChange(newOpts); };
  const removeOption = (idx) => { onChange(options.filter((_, i) => i !== idx)); };

  return (
    <div className="bg-gray-50 rounded border border-gray-200 p-2 space-y-2">
      <div className="flex text-[10px] text-gray-400 font-medium px-1"><span className="flex-[1.5]">显示文字</span><span className="flex-1 ml-2">实际值</span><span className="w-5"></span></div>
      {(options || []).map((opt, idx) => (
        <div key={idx} className="flex gap-2 items-center">
          <input className="flex-[1.5] text-xs border border-gray-300 rounded px-2 py-1 focus:border-indigo-500 outline-none" value={opt.label} onChange={e => updateOption(idx, 'label', e.target.value)} />
          <input className="flex-1 text-xs border border-gray-300 rounded px-2 py-1 focus:border-indigo-500 outline-none font-mono text-gray-600" value={opt.value} onChange={e => updateOption(idx, 'value', e.target.value)} />
          <button onClick={() => removeOption(idx)} className="text-gray-400 hover:text-red-500"><X size={14}/></button>
        </div>
      ))}
      <button onClick={addOption} className="text-xs text-indigo-600 font-medium flex items-center gap-1 hover:bg-indigo-50 px-2 py-1.5 rounded w-full justify-center border border-dashed border-indigo-200"><Plus size={12}/> 添加选项</button>
    </div>
  );
};

// --- 配置面板 ---
const FieldConfigPanel = ({ field, onChange, isSubField = false, onBack, onAddSubField, onRemoveSubField, onEditSubField }) => {
  return (
    <div className="p-5 space-y-6 animate-in slide-in-from-right duration-300">
      {isSubField && (
        <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-100">
          <button onClick={onBack} className="p-1 hover:bg-gray-100 rounded text-gray-600"><ArrowLeft size={16} /></button><span className="text-sm font-bold text-gray-800">配置列表子项</span>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">字段标识 (Key) <span className="text-indigo-500">*重要</span></label>
          <input value={field.id} onChange={e => onChange('id', e.target.value)} className="w-full px-3 py-2 border rounded text-xs font-mono outline-none focus:border-indigo-500 bg-white border-gray-300 text-gray-800" />
          <p className="text-[10px] text-gray-400 mt-1">命名提示：包含 <code>avatar</code> 自动渲染头像组件，包含 <code>contract</code> 自动渲染合同组件。</p>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">标题 (Title)</label>
          <input type="text" value={field.title} onChange={(e) => onChange('title', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
        </div>
        {['text', 'textarea', 'number', 'email'].includes(field.type) && (
           <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">占位提示 (Placeholder)</label>
            <input type="text" value={field.placeholder || ''} onChange={(e) => onChange('placeholder', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
          </div>
        )}
      </div>
      
      {['select', 'radio', 'checkbox'].includes(field.type) && (
        <div className="pt-4 border-t border-gray-100"><label className="block text-xs font-bold text-gray-700 mb-2">选项配置</label><OptionsEditor options={field.options} onChange={(newOpts) => onChange('options', newOpts)} /></div>
      )}

      {/* --- 上传基础限制 (纯业务约束) --- */}
      {field.type === 'upload' && (
        <div className="pt-4 border-t border-gray-100 space-y-3">
           <h4 className="text-xs font-bold text-gray-800">上传约束</h4>
           <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] text-gray-500 mb-1">允许类型</label>
              <input value={field.accept || '*/*'} onChange={e => onChange('accept', e.target.value)} className="w-full px-2 py-1 border rounded text-xs" placeholder="image/*" />
            </div>
            <div>
              <label className="block text-[10px] text-gray-500 mb-1">最大体积 (KB)</label>
              <input type="number" value={field.maxFileSize || 500} onChange={e => onChange('maxFileSize', Number(e.target.value))} className="w-full px-2 py-1 border rounded text-xs" />
            </div>
          </div>
        </div>
      )}

      {field.type === 'array' && !isSubField && (
        <div className="pt-4 border-t border-gray-100">
          <div className="flex justify-between items-center mb-2"><h4 className="text-xs font-bold text-gray-800">列表对象结构</h4></div>
          <div className="bg-gray-50 rounded-lg p-3 border border-gray-200 space-y-3">
            <div className="space-y-2">
              {(!field.subFields || field.subFields.length === 0) && <p className="text-xs text-gray-400 text-center py-4 bg-white rounded border border-dashed">暂无字段，请添加</p>}
              {field.subFields && field.subFields.map((sub, idx) => (
                <div key={idx} className="bg-white p-2 rounded border border-gray-200 shadow-sm flex items-center justify-between group">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded font-mono uppercase w-10 text-center">{sub.type}</span>
                    <span className="text-xs font-medium text-gray-700 truncate">{sub.title}</span>
                  </div>
                  <div className="flex items-center gap-1">
                     <button onClick={() => onEditSubField(sub.id)} className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded"><Edit2 size={12} /></button>
                     <button onClick={() => onRemoveSubField(sub.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"><Trash2 size={12} /></button>
                  </div>
                </div>
              ))}
            </div>
            <div className="pt-3 border-t border-gray-200 grid grid-cols-4 gap-1.5">
                {SUB_FIELD_TYPES.map(t => (
                  <button key={t.type} onClick={() => onAddSubField(t.type)} className="flex flex-col items-center justify-center p-2 bg-white border border-gray-200 rounded hover:border-indigo-500 hover:text-indigo-600 transition-all shadow-sm">
                    {t.icon} <span className="text-[9px] mt-1">{t.label}</span>
                  </button>
                ))}
            </div>
          </div>
        </div>
      )}

      {field.type !== 'array' && (
        <div className="pt-4 border-t border-gray-100 space-y-4">
          <h4 className="text-xs font-bold text-gray-800">校验规则</h4>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={field.required} onChange={(e) => onChange('required', e.target.checked)} className="rounded text-indigo-600 focus:ring-indigo-500" />
            <span className="text-sm text-gray-700">设为必填项</span>
          </label>
          {['text', 'textarea', 'email'].includes(field.type) && (
            <>
              <div className="grid grid-cols-2 gap-3 bg-gray-50 p-2 rounded border border-gray-100">
                 <div><label className="block text-[10px] font-medium text-gray-500 mb-1">最小字符数</label><input type="number" value={field.minLength ?? ''} onChange={(e) => onChange('minLength', e.target.value ? Number(e.target.value) : undefined)} className="w-full px-2 py-1 border rounded text-xs" /></div>
                 <div><label className="block text-[10px] font-medium text-gray-500 mb-1">最大限制 (强制)</label><input type="number" value={field.maxLength ?? ''} onChange={(e) => onChange('maxLength', e.target.value ? Number(e.target.value) : undefined)} className="w-full px-2 py-1 border rounded text-xs" /></div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">常用正则模板</label>
                <select onChange={(e) => { const preset = REGEX_PRESETS.find(p => p.value === e.target.value); if (preset) { onChange('validationRegex', preset.value); onChange('errorMsg', preset.msg); } }} className="w-full px-3 py-2 border border-gray-300 rounded text-xs bg-white focus:ring-2 focus:ring-indigo-500 outline-none">
                  <option value="">-- 选择预设模板 (自动填充) --</option>
                  {REGEX_PRESETS.filter(p => p.value).map((p, i) => (<option key={i} value={p.value}>{p.label}</option>))}
                </select>
              </div>
              <div className="grid gap-2">
                 <input type="text" value={field.validationRegex || ''} onChange={(e) => onChange('validationRegex', e.target.value)} className="w-full px-3 py-2 border rounded text-xs font-mono" placeholder="正则表达式" />
                 <input type="text" value={field.errorMsg || ''} onChange={(e) => onChange('errorMsg', e.target.value)} className="w-full px-3 py-2 border rounded text-xs" placeholder="错误提示文案" />
              </div>
            </>
          )}
          {['number', 'slider', 'rate'].includes(field.type) && (
             <div className="grid grid-cols-2 gap-2">
               <div>
                 <label className="block text-xs font-medium text-gray-500 mb-1">最小值</label>
                 <input type="number" value={field.minimum ?? ''} onChange={(e) => onChange('minimum', Number(e.target.value))} className="w-full px-2 py-1 border rounded text-xs" />
               </div>
               <div>
                 <label className="block text-xs font-medium text-gray-500 mb-1">最大值</label>
                 <input type="number" value={field.maximum ?? ''} onChange={(e) => onChange('maximum', Number(e.target.value))} className="w-full px-2 py-1 border rounded text-xs" />
               </div>
             </div>
          )}
        </div>
      )}
    </div>
  );
};

const PublishConfigModal = ({ isOpen, onClose, onConfirm, initialData }) => {
  const [meta, setMeta] = useState({ targetSystem: '', idSuffix: '', configName: '', configDesc: '', tags: '', isCanary: false });
  useEffect(() => { if (isOpen && initialData) setMeta({ targetSystem: initialData.targetSystem || '', idSuffix: initialData.idSuffix || '', configName: initialData.configName || '', configDesc: initialData.configDesc || '', tags: Array.isArray(initialData.tags) ? initialData.tags.join(', ') : '', isCanary: initialData.isCanary || false }); }, [isOpen, initialData]);
  if (!isOpen) return null;
  const computedConfigId = meta.targetSystem && meta.idSuffix ? `${meta.targetSystem.split(' ')[0]}_${meta.idSuffix}` : '请先填写目标系统和自定义ID';
  const handleConfirm = () => { if (!meta.targetSystem || !meta.idSuffix || !meta.configName) { alert('请补全必填信息'); return; } const finalData = { ...meta, tags: meta.tags.split(/[,，]/).map(t => t.trim()).filter(Boolean), configId: computedConfigId }; onConfirm(finalData); };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg flex flex-col overflow-hidden">
        <div className="bg-indigo-600 px-6 py-4 flex justify-between items-center"><h3 className="text-lg font-bold text-white flex items-center gap-2"><Server size={20} /> 发布表单配置</h3><button onClick={onClose} className="text-indigo-200 hover:text-white"><X size={20}/></button></div>
        <div className="p-6 space-y-5 overflow-y-auto max-h-[70vh]">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-xs font-bold text-gray-700 mb-1">目标系统 <span className="text-red-500">*</span></label><select value={meta.targetSystem} onChange={e => setMeta({...meta, targetSystem: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"><option value="">请选择...</option>{TARGET_SYSTEMS.map(sys => <option key={sys} value={sys}>{sys}</option>)}</select></div>
            <div><label className="block text-xs font-bold text-gray-700 mb-1">ID后缀 <span className="text-red-500">*</span></label><input type="text" value={meta.idSuffix} onChange={e => setMeta({...meta, idSuffix: e.target.value.replace(/[^a-zA-Z0-9_-]/g, '')})} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-mono" placeholder="如: login_v1" /></div>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded p-3 flex items-center gap-2 text-xs text-gray-600"><Fingerprint size={14} className="text-indigo-500"/> ID: <span className="font-mono font-bold text-indigo-700">{computedConfigId}</span></div>
          <div><label className="block text-xs font-bold text-gray-700 mb-1">配置名称 <span className="text-red-500">*</span></label><input type="text" maxLength={50} value={meta.configName} onChange={e => setMeta({...meta, configName: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" /></div>
          <div><label className="block text-xs font-bold text-gray-700 mb-1">描述</label><textarea rows={3} maxLength={200} value={meta.configDesc} onChange={e => setMeta({...meta, configDesc: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none" /></div>
          <div><label className="block text-xs font-bold text-gray-700 mb-1">标签</label><div className="flex items-center gap-2 border rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-indigo-500"><Tag size={16} className="text-gray-400"/><input type="text" value={meta.tags} onChange={e => setMeta({...meta, tags: e.target.value})} className="w-full text-sm outline-none" placeholder="逗号分隔" /></div></div>
          <div className="flex items-center justify-between pt-2"><span className="text-sm font-bold text-gray-700">开启灰度发布</span><button onClick={() => setMeta({...meta, isCanary: !meta.isCanary})} className={`w-12 h-6 rounded-full transition-colors relative ${meta.isCanary ? 'bg-green-500' : 'bg-gray-300'}`}><div className={`w-4 h-4 bg-white rounded-full absolute top-1 shadow transition-all ${meta.isCanary ? 'left-7' : 'left-1'}`} /></button></div>
        </div>
        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3"><Button variant="secondary" onClick={onClose}>取消</Button><Button onClick={handleConfirm}>确认发布</Button></div>
      </div>
    </div>
  );
};

export default function App() {
  const [user, setUser] = useState(null);
  const [mode, setMode] = useState('builder'); 
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) { await signInWithCustomToken(auth, __initial_auth_token); } 
      else { await signInAnonymously(auth); }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, (u) => { setUser(u); setLoading(false); });
    return () => unsubscribe();
  }, []);

  if (loading) return <div className="flex items-center justify-center h-screen text-gray-500">加载系统中...</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center shadow-sm z-20 sticky top-0">
        <div className="flex items-center gap-3"><div className="bg-indigo-600 p-2 rounded-lg text-white"><Layout size={20} /></div><div><h1 className="text-xl font-bold text-gray-800">Schema Form Engine</h1><p className="text-xs text-gray-500">V13.0 • 智能组件映射</p></div></div>
        <div className="bg-gray-100 p-1 rounded-lg flex gap-1">{[{ id: 'builder', label: '表单设计' }, { id: 'runner', label: '运营填写' }, { id: 'data', label: '数据管理' }].map(tab => (<button key={tab.id} onClick={() => setMode(tab.id)} className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${mode === tab.id ? `bg-white text-indigo-600 shadow-sm` : 'text-gray-500 hover:text-gray-700'}`}>{tab.label}</button>))}</div>
      </header>
      <main className="flex-1 overflow-hidden relative">
        {mode === 'builder' && <FormBuilder user={user} />}
        {mode === 'runner' && <FormRunner user={user} />}
        {mode === 'data' && <DataViewer user={user} />}
      </main>
    </div>
  );
}

function FormBuilder({ user }) {
  const [fields, setFields] = useState([]);
  const [metaData, setMetaData] = useState(null);
  const [selectedFieldId, setSelectedFieldId] = useState(null);
  const [editingSubFieldId, setEditingSubFieldId] = useState(null); 
  const [isSaving, setIsSaving] = useState(false);
  const [showJson, setShowJson] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false); 
  const [validationErrors, setValidationErrors] = useState([]);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [jsonInput, setJsonInput] = useState('');

  useEffect(() => {
    if (!user) return;
    const fetchSchema = async () => {
      const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'schemas', FORM_ID);
      try {
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.meta) setMetaData(data.meta);
          if (data.schema && data.schema.properties) {
             const loadedFields = parseSchemaToFields(data.schema);
             if (data.uiOrder) loadedFields.sort((a, b) => data.uiOrder.indexOf(a.id) - data.uiOrder.indexOf(b.id));
             setFields(loadedFields);
          }
        }
      } catch (e) { console.error("Error fetching:", e); }
    };
    fetchSchema();
  }, [user]);

  useEffect(() => { if (showJson) setJsonInput(JSON.stringify(generateSchema(), null, 2)); }, [showJson, fields]);

  const handleRestoreFromJson = () => {
    try {
      const parsedSchema = JSON.parse(jsonInput);
      if (!parsedSchema.properties) { alert("无效 Schema"); return; }
      setFields(parseSchemaToFields(parsedSchema));
      setSelectedFieldId(null);
      alert("还原成功");
      setShowJson(false); 
    } catch (e) { alert("JSON Error: " + e.message); }
  };

  const addField = (type) => {
    const newField = { id: `field_${Date.now()}`, type, title: `未命名${COMPONENT_TYPES.find(c => c.type === type)?.label}`, required: false, options: ['select', 'radio', 'checkbox'].includes(type) ? [{ label: 'A', value: 'a' }] : undefined, subFields: [] };
    setFields([...fields, newField]);
    setSelectedFieldId(newField.id);
    setEditingSubFieldId(null); 
    setValidationErrors([]); 
  };

  const updateField = (id, key, value) => {
    setFields(fields.map(f => f.id === id ? { ...f, [key]: value } : f));
    if (key === 'id' && selectedFieldId === id) setSelectedFieldId(value);
    setValidationErrors([]); 
  };

  const removeField = (id, e) => {
    e.stopPropagation();
    setFields(fields.filter(f => f.id !== id));
    if (selectedFieldId === id) { setSelectedFieldId(null); setEditingSubFieldId(null); }
    setValidationErrors([]);
  };

  const addSubField = (parentId, type) => {
    const parent = fields.find(f => f.id === parentId);
    if (!parent) return;
    const newSub = { id: `sub_${Date.now()}`, type, title: '新字段', required: false, options: ['select', 'radio'].includes(type) ? [{ label: '1', value: '1' }] : undefined };
    updateField(parentId, 'subFields', [...parent.subFields, newSub]);
  };

  const removeSubField = (parentId, subId) => {
    const parent = fields.find(f => f.id === parentId);
    if (!parent) return;
    updateField(parentId, 'subFields', parent.subFields.filter(sf => sf.id !== subId));
    if (editingSubFieldId === subId) setEditingSubFieldId(null);
  };

  const updateSubField = (parentId, subId, key, value) => {
    const parent = fields.find(f => f.id === parentId);
    if (!parent) return;
    const newSubFields = parent.subFields.map(sf => sf.id === subId ? { ...sf, [key]: value } : sf);
    updateField(parentId, 'subFields', newSubFields);
    if (key === 'id' && editingSubFieldId === subId) setEditingSubFieldId(value);
    setValidationErrors([]); 
  };

  const validateFormStructure = () => {
    const errors = [];
    const topLevelIds = new Set();
    fields.forEach((field, index) => {
      if (!field.id || !field.id.trim()) errors.push(`第 ${index + 1} 个组件 Key 不能为空`);
      else if (topLevelIds.has(field.id)) errors.push(`重复 Key: "${field.id}"`);
      else topLevelIds.add(field.id);

      if (field.type === 'array' && field.subFields) {
        const subIds = new Set();
        field.subFields.forEach((sub, subIdx) => {
          if (!sub.id || !sub.id.trim()) errors.push(`"${field.title}" 的子项 Key 不能为空`);
          else if (subIds.has(sub.id)) errors.push(`"${field.title}" 内部重复 Key: "${sub.id}"`);
          else subIds.add(sub.id);
        });
      }
    });
    return errors;
  };

  const generateSchema = () => {
    const buildProperties = (fieldList) => {
      const properties = {};
      const required = [];
      fieldList.forEach(field => {
        const base = { title: field.title };
        if (field.description) base.description = field.description;
        let typeSchema = {};
        if (field.type === 'array') {
          typeSchema = { type: 'array', uiWidget: 'array', items: { type: 'object', properties: buildProperties(field.subFields).properties, required: buildProperties(field.subFields).required } };
        } else {
          typeSchema = { type: ['number', 'slider', 'rate'].includes(field.type) ? 'number' : field.type === 'switch' ? 'boolean' : 'string', uiWidget: field.type };
          if (field.placeholder) typeSchema.placeholder = field.placeholder;
          if (field.validationRegex) typeSchema.pattern = field.validationRegex;
          if (field.errorMsg) typeSchema.errorMessage = field.errorMsg;
          if (field.minLength) typeSchema.minLength = field.minLength;
          if (field.maxLength) typeSchema.maxLength = field.maxLength;
          if (field.minimum !== undefined) typeSchema.minimum = field.minimum;
          if (field.maximum !== undefined) typeSchema.maximum = field.maximum;
          
          // 上传限制
          if (field.type === 'upload') {
             typeSchema.accept = field.accept;
             typeSchema.maxFileSize = field.maxFileSize;
          }

          if (['select', 'radio', 'checkbox'].includes(field.type) && field.options) {
            typeSchema.enum = field.options.map(o => o.value);
            typeSchema.enumNames = field.options.map(o => o.label);
            if (field.type === 'checkbox') typeSchema = { type: 'array', items: { type: 'string', enum: typeSchema.enum, enumNames: typeSchema.enumNames }, uniqueItems: true };
          }
        }
        properties[field.id] = { ...base, ...typeSchema };
        if (field.required) required.push(field.id);
      });
      return { properties, required };
    };
    const { properties, required } = buildProperties(fields);
    return { type: "object", title: "GeneratedForm", properties, required };
  };

  const handlePrePublish = () => {
    const errors = validateFormStructure();
    if (errors.length > 0) { setValidationErrors(errors); return; }
    setShowPublishModal(true);
  };

  const handleFinalPublish = async (publishMeta) => {
    if (!user) return;
    setIsSaving(true);
    setShowPublishModal(false);
    try {
      const schema = generateSchema();
      const uiOrder = fields.map(f => f.id); 
      const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'schemas', FORM_ID);
      await setDoc(docRef, { schema, uiOrder, meta: publishMeta, updatedAt: serverTimestamp(), author: user.uid });
      alert('发布成功！');
      setMetaData(publishMeta);
    } catch (error) { alert('保存失败: ' + error.message); }
    setIsSaving(false);
  };

  if (isPreviewMode) return (
      <div className="flex flex-col h-full bg-gray-50">
        <div className="bg-indigo-900 text-white px-4 py-3 flex justify-between items-center shadow-md z-10"><span className="font-bold flex items-center gap-2"><MonitorPlay size={18}/> 模拟预览中</span><button onClick={() => setIsPreviewMode(false)} className="bg-white/20 hover:bg-white/30 text-xs px-3 py-1.5 rounded">退出预览</button></div>
        <div className="flex-1 overflow-hidden"><FormRunner user={user} propFields={fields} isBuilderPreview={true} /></div>
      </div>
  );

  const selectedField = fields.find(f => f.id === selectedFieldId);
  const editingSubField = selectedField?.subFields?.find(sf => sf.id === editingSubFieldId);

  return (
    <div className="flex h-full relative">
      <PublishConfigModal isOpen={showPublishModal} onClose={() => setShowPublishModal(false)} onConfirm={handleFinalPublish} initialData={metaData} />
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col z-10 shadow-sm">
        <div className="p-4 border-b border-gray-100 bg-gray-50/50"><h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">组件库</h3></div>
        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          {['basic', 'select', 'advanced', 'layout'].map(group => (
            <div key={group}>
              <div className="text-[10px] font-semibold text-gray-400 mb-2 uppercase px-1">{group}</div>
              <div className="grid grid-cols-2 gap-2">
                {COMPONENT_TYPES.filter(c => c.group === group).map((comp) => (
                  <button key={comp.type} onClick={() => { addField(comp.type); if(showJson) setShowJson(false); }} className="flex flex-col items-center justify-center p-3 border border-gray-100 bg-white rounded-lg hover:border-indigo-500 hover:bg-indigo-50 hover:shadow-md transition-all group text-gray-600 hover:text-indigo-600">
                    <span className="mb-1 opacity-60 group-hover:opacity-100 transition-opacity">{comp.icon}</span><span className="text-xs">{comp.label}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex-1 flex flex-col min-w-0 bg-gray-100/80">
        <div className="h-14 bg-white border-b border-gray-200 flex justify-between items-center px-4 shadow-sm z-10">
          <div className="flex items-center gap-2">
            <button onClick={() => setShowJson(!showJson)} className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full transition-all border ${showJson ? 'bg-gray-800 border-gray-800 text-white' : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'}`}><Code size={14} /> {showJson ? '关闭编辑器' : 'JSON'}</button>
            <button onClick={() => setIsPreviewMode(true)} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full transition-all border bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100 font-medium"><Play size={14} fill="currentColor"/> 试运行</button>
          </div>
          <Button onClick={handlePrePublish} disabled={isSaving} icon={Save} size="sm">{isSaving ? '发布中...' : '发布表单'}</Button>
        </div>
        {validationErrors.length > 0 && (<div className="bg-red-50 border-b border-red-200 p-3 flex items-start gap-3 animate-in slide-in-from-top-2"><AlertTriangle className="text-red-500 shrink-0 mt-0.5" size={18} /><div className="flex-1"><h4 className="text-sm font-bold text-red-800 mb-1">无法发布</h4><ul className="list-disc list-inside text-xs text-red-700 space-y-0.5">{validationErrors.map((err, i) => <li key={i}>{err}</li>)}</ul></div><button onClick={() => setValidationErrors([])} className="text-red-400 hover:text-red-600"><X size={16}/></button></div>)}
        <div className="flex-1 overflow-y-auto p-8 relative">
          {showJson ? (
            <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-200 h-[600px] flex flex-col animate-in fade-in zoom-in duration-200">
               <div className="bg-gray-800 text-white px-4 py-3 flex justify-between items-center"><h3 className="text-sm font-mono flex items-center gap-2"><FileJson size={16}/> Schema Editor</h3><button onClick={() => navigator.clipboard.writeText(jsonInput)} className="text-xs hover:text-indigo-300 flex items-center gap-1"><ClipboardList size={14}/> 复制</button></div>
               <textarea value={jsonInput} onChange={e => setJsonInput(e.target.value)} className="flex-1 p-4 font-mono text-xs text-gray-800 resize-none outline-none focus:bg-gray-50" spellCheck="false"/>
               <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-between items-center"><span className="text-xs text-gray-400">在此粘贴 JSON Schema 可还原设计</span><Button onClick={handleRestoreFromJson} icon={Import} size="sm">应用并还原设计</Button></div>
            </div>
          ) : (
            <div className="max-w-2xl mx-auto min-h-[600px] bg-white rounded-xl shadow-sm border border-gray-200 p-8 space-y-4">
              {fields.length === 0 ? (<div className="h-full flex flex-col items-center justify-center text-gray-300 py-32 border-2 border-dashed border-gray-100 rounded-xl bg-gray-50/50"><Plus size={48} className="mb-4 text-gray-200" /><p>从左侧拖拽或点击添加组件</p></div>) : (
                fields.map((field) => (
                  <div key={field.id} onClick={() => { setSelectedFieldId(field.id); setEditingSubFieldId(null); }} className={`relative group p-4 rounded-xl border-2 transition-all cursor-pointer bg-white ${selectedFieldId === field.id ? 'border-indigo-500 shadow-md ring-2 ring-indigo-50' : 'border-transparent hover:border-gray-200 hover:bg-gray-50'}`}>
                    <div className="pointer-events-none space-y-2">
                      <div className="flex items-center justify-between"><label className="text-sm font-semibold text-gray-700 flex items-center gap-1">{field.title} {field.required && <span className="text-red-500">*</span>}</label><span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 font-mono">{field.type}</span></div>
                      {renderPreviewComponent(field)}
                      {field.description && <p className="text-xs text-gray-400">{field.description}</p>}
                    </div>
                    <button onClick={(e) => removeField(field.id, e)} className="absolute top-2 right-2 p-1.5 bg-white text-red-500 rounded-md shadow border border-gray-100 opacity-0 group-hover:opacity-100 hover:bg-red-50 transition-all z-10"><Trash2 size={14} /></button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
      <div className="w-80 bg-white border-l border-gray-200 flex flex-col z-10 shadow-sm overflow-y-auto">
        <div className="p-4 border-b border-gray-100 bg-gray-50/50"><h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2"><Settings size={14} /> 属性配置</h3></div>
        {selectedField ? (
          editingSubFieldId ? (<FieldConfigPanel field={editingSubField} isSubField={true} onChange={(k, v) => updateSubField(selectedField.id, editingSubField.id, k, v)} onBack={() => setEditingSubFieldId(null)} />) : (<FieldConfigPanel field={selectedField} onChange={(k, v) => updateField(selectedField.id, k, v)} onAddSubField={(type) => addSubField(selectedField.id, type)} onRemoveSubField={(subId) => removeSubField(selectedField.id, subId)} onEditSubField={(subId) => setEditingSubFieldId(subId)} />)
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-6 text-center bg-gray-50/30"><Settings size={48} className="mb-4 opacity-20" /><p className="text-sm font-medium">请在画布中选择组件<br/>以配置详细属性</p></div>
        )}
      </div>
    </div>
  );
}

function renderPreviewComponent(field) {
  const commonClass = "w-full bg-gray-50 border border-gray-200 rounded px-3 py-2 text-sm text-gray-400";
  const renderOptions = (opts) => (<div className="flex flex-wrap gap-2">{(opts || []).map(o => (<span key={o.value} className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-500">{o.label}</span>))}</div>);
  if (field.type === 'array') return (<div className="border border-dashed border-indigo-200 bg-indigo-50/30 rounded p-3 space-y-2">{field.subFields && field.subFields.length > 0 ? (<div className="grid gap-2">{field.subFields.map(sub => (<div key={sub.id} className="flex items-center gap-2 bg-white px-2 py-2 rounded border border-gray-100 shadow-sm"><span className="text-[10px] text-white bg-gray-400 px-1 rounded uppercase w-8 text-center">{sub.type.slice(0,3)}</span><span className="text-xs text-gray-700 flex-1">{sub.title}</span><span className="text-[10px] text-gray-400 font-mono">{sub.id}</span></div>))}<div className="text-xs text-indigo-500 text-center mt-2 border-t border-dashed border-indigo-200 pt-2 flex items-center justify-center gap-1"><Plus size={12}/> 点击“添加一项”将重复上述结构</div></div>) : (<div className="text-xs text-gray-400 text-center italic py-2">请在右侧配置列表包含的字段</div>)}</div>);
  switch(field.type) {
    case 'textarea': return <div className={`${commonClass} h-20`}>{field.placeholder}</div>;
    case 'select': return <div className={`${commonClass} flex justify-between`}><span>请选择...</span><span>▼</span></div>;
    case 'radio': return <div className="mt-1">{renderOptions(field.options)}</div>;
    case 'checkbox': return <div className="mt-1">{renderOptions(field.options)}</div>;
    case 'switch': return <div className="w-10 h-5 bg-gray-200 rounded-full relative"><div className="w-3 h-3 bg-white rounded-full absolute top-1 left-1 shadow"></div></div>;
    case 'slider': return <div className="w-full h-2 bg-gray-200 rounded relative mt-2"><div className="w-1/3 h-full bg-indigo-300 rounded"></div><div className="w-4 h-4 bg-white border border-gray-300 rounded-full absolute top-[-4px] left-1/3 shadow"></div></div>;
    case 'rate': return <div className="flex gap-1 text-gray-300"><Star size={16} fill="currentColor"/><Star size={16} fill="currentColor"/><Star size={16} fill="currentColor"/><Star size={16}/><Star size={16}/></div>;
    case 'upload': return <div className={`${commonClass} flex items-center gap-2 text-gray-400`}><Upload size={14}/> 点击上传文件</div>;
    default: return <div className={commonClass}>{field.placeholder}</div>;
  }
}

// ----------------------------------------------------------------------
// FormRunner
// ----------------------------------------------------------------------
function FormRunner({ user, propFields, isBuilderPreview }) {
  const [fields, setFields] = useState([]); 
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewTab, setPreviewTab] = useState('visual'); 
  const [isLoading, setIsLoading] = useState(true);

  const generateInitialValues = (fieldList) => {
    const values = {};
    fieldList.forEach(field => {
      if (field.type === 'array') values[field.id] = []; 
      else if (field.type === 'checkbox') values[field.id] = [];
      else if (field.type === 'switch') values[field.id] = false;
      else if (field.type === 'number' || field.type === 'slider' || field.type === 'rate') values[field.id] = field.minimum || 0;
      else values[field.id] = '';
    });
    return values;
  };

  const loadSchema = useCallback(async () => {
    setIsLoading(true);
    setSubmitted(false);
    setErrors({});
    const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'schemas', FORM_ID);
    try {
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data();
        if (data.schema && data.schema.properties) {
          const parseFields = (props, requiredList = []) => {
              return Object.keys(props).map(key => {
                 const prop = props[key];
                 const isArray = prop.type === 'array';
                 let options = undefined;
                 if (prop.enum) options = prop.enum.map((val, i) => ({ value: val, label: (prop.enumNames && prop.enumNames[i]) ? prop.enumNames[i] : val }));
                 else if (prop.items && prop.items.enum) options = prop.items.enum.map((val, i) => ({ value: val, label: (prop.items.enumNames && prop.items.enumNames[i]) ? prop.items.enumNames[i] : val }));
                 return {
                   id: key,
                   type: prop.uiWidget || (isArray ? 'array' : 'text'),
                   title: prop.title,
                   description: prop.description,
                   required: requiredList.includes(key),
                   placeholder: prop.placeholder,
                   options: options,
                   pattern: prop.pattern,
                   errorMessage: prop.errorMessage,
                   minimum: prop.minimum,
                   maximum: prop.maximum,
                   minLength: prop.minLength,
                   maxLength: prop.maxLength,
                   accept: prop.accept,
                   maxFileSize: prop.maxFileSize,
                   subFields: (isArray && prop.items && prop.items.type === 'object') ? parseFields(prop.items.properties, prop.items.required) : []
                 };
              });
          };
          const parsed = parseFields(data.schema.properties, data.schema.required);
          if (data.uiOrder) parsed.sort((a, b) => data.uiOrder.indexOf(a.id) - data.uiOrder.indexOf(b.id));
          setFields(parsed);
          setFormData(generateInitialValues(parsed));
        }
      }
    } catch (e) { console.error("Error:", e); } finally { setIsLoading(false); }
  }, [appId]);

  useEffect(() => {
    if (!user && !isBuilderPreview) return;
    if (propFields) { setFields(propFields); setFormData(generateInitialValues(propFields)); setIsLoading(false); return; }
    loadSchema();
  }, [user, propFields, isBuilderPreview, loadSchema]);

  const handleChange = useCallback((id, value) => {
    setFormData(prev => ({ ...prev, [id]: value }));
    if (errors[id]) { const newErrors = { ...errors }; delete newErrors[id]; setErrors(newErrors); }
  }, [errors]);

  const validate = () => {
    const newErrors = {};
    let isValid = true;
    const checkField = (field, value, path) => {
      if (field.required) {
         const isEmpty = value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0);
         if (isEmpty) { newErrors[path] = '此项为必填项'; isValid = false; }
      }
      if (field.minLength && value && value.length < field.minLength) { newErrors[path] = `至少输入 ${field.minLength} 个字符`; isValid = false; }
      if (value && field.pattern && !newErrors[path]) { try { if (!new RegExp(field.pattern).test(value)) { newErrors[path] = field.errorMessage || '格式不正确'; isValid = false; } } catch(e) {} }
      if (field.type === 'array' && Array.isArray(value)) {
        value.forEach((item, index) => { if (field.subFields) { field.subFields.forEach(sub => { checkField(sub, item[sub.id], `${path}.${index}.${sub.id}`); }); } });
      }
    };
    fields.forEach(field => checkField(field, formData[field.id], field.id));
    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async () => {
    if (!validate()) { alert("请检查表单中的错误项"); return; }
    if (isBuilderPreview) { alert("这是预览模式，无法提交数据"); return; }
    setSubmitting(true);
    try {
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', `submissions_${FORM_ID}`), { data: formData, submittedAt: serverTimestamp(), uid: user.uid });
      setSubmitted(true);
    } catch (e) { alert('提交失败'); }
    setSubmitting(false);
  };

  if (submitted) return (<div className="flex flex-col items-center justify-center h-full bg-white p-8 animate-in fade-in zoom-in duration-300"><CheckCircle size={64} className="text-green-500 mb-4" /><h2 className="text-2xl font-bold text-gray-800">提交成功</h2><button onClick={()=>{setSubmitted(false); setFormData(generateInitialValues(fields));}} className="mt-6 text-indigo-600 hover:underline">再次填写</button></div>);
  if (isLoading) return (<div className="flex flex-col items-center justify-center h-full text-gray-400 p-8 space-y-4"><RefreshCw className="animate-spin text-indigo-500" size={32} /><p>正在加载表单配置...</p></div>);
  if (fields.length === 0) return (<div className="flex flex-col items-center justify-center h-full text-gray-400 p-8 space-y-4"><div className="bg-gray-100 p-6 rounded-full"><ClipboardList size={48} className="text-gray-300" /></div><div className="text-center"><h3 className="text-lg font-semibold text-gray-600">暂无发布表单</h3><p className="text-sm text-gray-400 mt-1">请等待管理员发布新的数据采集任务</p></div><Button onClick={loadSchema} variant="secondary" icon={RefreshCw} size="sm">刷新重试</Button></div>);

  return (
    <div className="h-full overflow-y-auto bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100">
        <div className="bg-indigo-600 px-8 py-6 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] flex justify-between items-start"><div><h1 className="text-2xl font-bold text-white">信息收集表</h1><p className="text-indigo-100 mt-2 text-sm opacity-90">请仔细填写以下信息</p></div></div>
        <div className="p-8 space-y-6">
          {fields.map(field => (
            <div key={field.id} className="space-y-1.5"><label className="block text-sm font-semibold text-gray-700">{field.title} {field.required && <span className="text-red-500">*</span>}</label><DynamicInput field={field} value={formData[field.id]} onChange={(v) => handleChange(field.id, v)} path={field.id} errors={errors} />{field.description && <p className="text-xs text-gray-400">{field.description}</p>}{errors[field.id] && <div className="flex items-center gap-1 text-xs text-red-500 animate-pulse font-medium"><AlertCircle size={12} /> {errors[field.id]}</div>}</div>
          ))}
          <div className="pt-6 flex gap-3"><Button type="button" onClick={() => setShowPreview(true)} variant="secondary" className="flex-1 py-3 text-lg" icon={Eye}>数据预览</Button><Button onClick={handleSubmit} disabled={submitting} className="flex-1 py-3 text-lg shadow-lg shadow-indigo-200">{submitting ? '提交中...' : '确认提交'}</Button></div>
        </div>
        {showPreview && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg flex flex-col max-h-[80vh] animate-in fade-in zoom-in duration-200">
                    <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-xl">
                        <div className="flex items-center gap-4"><h3 className="text-lg font-bold text-gray-800">填写内容确认</h3><div className="flex bg-gray-100 rounded p-0.5"><button onClick={() => setPreviewTab('visual')} className={`text-xs px-3 py-1 rounded transition-all ${previewTab === 'visual' ? 'bg-white shadow text-indigo-600 font-medium' : 'text-gray-500 hover:text-gray-700'}`}>可视化</button><button onClick={() => setPreviewTab('json')} className={`text-xs px-3 py-1 rounded transition-all ${previewTab === 'json' ? 'bg-white shadow text-indigo-600 font-medium' : 'text-gray-500 hover:text-gray-700'}`}>JSON源</button></div></div><button onClick={() => setShowPreview(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-all"><X size={20} /></button>
                    </div>
                    <div className="flex-1 overflow-auto bg-gray-50">
                        {previewTab === 'json' ? (<pre className="text-xs text-[#9cdcfe] font-mono p-6 leading-relaxed bg-[#1e1e1e] h-full">{JSON.stringify(formData, null, 2)}</pre>) : (<div className="p-6 space-y-4">{fields.map(field => (<div key={field.id} className="bg-white p-3 rounded border border-gray-200 shadow-sm"><div className="text-xs text-gray-400 mb-1">{field.title}</div><div className="text-sm text-gray-800 font-medium break-all">{field.type === 'array' ? (<div className="space-y-2 mt-2">{(formData[field.id] || []).map((item, i) => (<div key={i} className="bg-gray-50 p-2 rounded border border-gray-100 text-xs"><div className="font-bold text-gray-400 mb-1">Item {i+1}</div>{field.subFields.map(sub => (<div key={sub.id} className="flex gap-2"><span className="text-gray-500">{sub.title}:</span><span>{String(item[sub.id])}</span></div>))}</div>))}{(formData[field.id] || []).length === 0 && <span className="text-gray-400 italic">无数据</span>}</div>) : ( String(formData[field.id] === undefined || formData[field.id] === '' ? '-' : formData[field.id]) )}</div></div>))}</div>)}
                    </div>
                    <div className="p-4 border-t border-gray-100 bg-white rounded-b-xl flex justify-end gap-3"><Button variant="secondary" onClick={() => setShowPreview(false)}>返回修改</Button><Button onClick={() => { setShowPreview(false); handleSubmit(); }}>确认提交</Button></div>
                </div>
            </div>
        )}
      </div>
    </div>
  );
}

// --- DynamicInput (Runner的核心渲染器) ---
function DynamicInput({ field, value, onChange, path, errors }) {
  const currentError = errors && path ? errors[path] : null;
  const commonClass = `w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all ${currentError ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300'}`;
  const safeValue = value === undefined || value === null ? '' : value;
  const [uploading, setUploading] = useState(false);

  // --- 智能组件映射策略 (Mapping Strategy) ---
  // 如果是 Upload 类型，根据 Key 的特征自动选择“业务组件实现”
  if (field.type === 'upload') {
    const lowerId = field.id.toLowerCase();

    // 1. 头像上传组件 (Mapping: key contains 'avatar' or 'photo')
    if (lowerId.includes('avatar') || lowerId.includes('photo')) {
        return (
          <div className="flex flex-col items-center p-4 border rounded-lg bg-gray-50 border-dashed hover:border-indigo-300 transition-colors">
            <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden mb-2 border-2 border-white shadow-sm relative group cursor-pointer">
                {safeValue ? <img src={safeValue} alt="Avatar" className="w-full h-full object-cover"/> : <User size={32} className="text-gray-400"/>}
                <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                      const reader = new FileReader();
                      reader.onload = (ev) => onChange(ev.target.result);
                      reader.readAsDataURL(file);
                  }
                }}/>
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold transition-opacity">更换</div>
            </div>
            <span className="text-xs text-gray-500 font-medium">点击上传头像</span>
          </div>
        );
    }

    // 2. 合同/文档上传组件 (Mapping: key contains 'contract' or 'doc')
    if (lowerId.includes('contract') || lowerId.includes('doc') || lowerId.includes('file')) {
        return (
          <div className="border border-blue-100 bg-blue-50/50 p-3 rounded-lg flex items-center justify-between group hover:bg-blue-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-lg"><FileCheck className="text-blue-600" size={20}/></div>
                <div>
                    <div className="text-sm font-bold text-blue-900">文档上传</div>
                    <div className="text-[10px] text-blue-500">{safeValue ? '已选择文件' : '支持 PDF, Word'}</div>
                </div>
              </div>
              <label className="bg-white text-blue-600 border border-blue-200 px-4 py-1.5 rounded-md text-xs font-medium cursor-pointer hover:shadow-sm transition-all">
                {safeValue ? '重新上传' : '选择文件'}
                <input type="file" className="hidden" onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) onChange(file.name); // 模拟上传
                }}/>
              </label>
          </div>
        );
    }
    
    // 3. 默认通用上传组件 (Fallback)
    // ... fallback code below in switch ...
  }

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (field.maxFileSize && file.size > field.maxFileSize * 1024) { alert(`文件大小不能超过 ${field.maxFileSize}KB`); return; }
    const reader = new FileReader();
    reader.onload = (e) => onChange(e.target.result);
    reader.readAsDataURL(file);
  };

  const renderOptions = () => (<><option value="">请选择...</option>{field.options && field.options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}</>);

  switch (field.type) {
    case 'upload': // Default Upload
      return (
        <div className="space-y-2">
          <label className={`flex items-center justify-center w-full h-24 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${currentError ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}>
            <div className="flex flex-col items-center">
              <Upload size={24} className="text-gray-400 mb-1" />
              <span className="text-xs text-gray-500">点击上传文件</span>
            </div>
            <input type="file" className="hidden" accept={field.accept} onChange={handleFileUpload} disabled={uploading} />
          </label>
          {safeValue && (<div className="flex items-center gap-2 p-2 bg-gray-50 rounded border border-gray-200">{safeValue.startsWith('data:image') || safeValue.match(/\.(jpeg|jpg|gif|png)$/) ? <ImageIcon size={16} className="text-indigo-500"/> : <FileText size={16} className="text-gray-500"/>}<span className="text-xs text-gray-600 truncate flex-1">已上传文件</span><button onClick={() => onChange('')} className="text-red-400 hover:text-red-600"><X size={14}/></button></div>)}
        </div>
      );
    case 'textarea': return (<div className="relative"><textarea value={safeValue} onChange={e => onChange(e.target.value)} className={commonClass} rows={3} placeholder={field.placeholder} maxLength={field.maxLength} />{field.maxLength && <span className="absolute bottom-2 right-2 text-xs text-gray-400 pointer-events-none bg-white px-1 rounded">{safeValue.length}/{field.maxLength}</span>}</div>);
    case 'select': return (<div className="relative"><select value={safeValue} onChange={e => onChange(e.target.value)} className={`${commonClass} appearance-none bg-white`}>{renderOptions()}</select><div className="absolute right-3 top-3 pointer-events-none text-gray-400">▼</div></div>);
    case 'radio': return (<div className="flex flex-wrap gap-4 pt-1">{field.options && field.options.map(opt => (<label key={opt.value} className="flex items-center gap-2 cursor-pointer group" onClick={() => onChange(opt.value)}><div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${safeValue === opt.value ? 'border-indigo-600 bg-indigo-600' : 'border-gray-300 group-hover:border-indigo-400'}`}>{safeValue === opt.value && <div className="w-1.5 h-1.5 bg-white rounded-full" />}</div><span className="text-sm text-gray-700">{opt.label}</span></label>))}</div>);
    case 'checkbox':
      const currentVals = Array.isArray(value) ? value : [];
      const toggleCheck = (optVal) => { if (currentVals.includes(optVal)) onChange(currentVals.filter(v => v !== optVal)); else onChange([...currentVals, optVal]); };
      return (<div className="flex flex-wrap gap-4 pt-1">{field.options && field.options.map(opt => (<label key={opt.value} className="flex items-center gap-2 cursor-pointer group"><input type="checkbox" className="hidden" checked={currentVals.includes(opt.value)} onChange={() => toggleCheck(opt.value)} /><div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${currentVals.includes(opt.value) ? 'border-indigo-600 bg-indigo-600' : 'border-gray-300 group-hover:border-indigo-400'}`}>{currentVals.includes(opt.value) && <CheckSquare size={12} className="text-white" />}</div><span className="text-sm text-gray-700">{opt.label}</span></label>))}</div>);
    case 'switch': return (<button onClick={() => onChange(!value)} className={`w-12 h-6 rounded-full transition-colors relative ${value ? 'bg-indigo-600' : 'bg-gray-300'}`}><div className={`w-4 h-4 bg-white rounded-full absolute top-1 shadow transition-all ${value ? 'left-7' : 'left-1'}`} /></button>);
    case 'slider': return (<div className="flex items-center gap-4"><input type="range" min={field.minimum || 0} max={field.maximum || 100} value={value || 0} onChange={e => onChange(Number(e.target.value))} className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600" /><span className="text-sm font-mono font-medium text-gray-600 min-w-[30px] text-right">{value || 0}</span></div>);
    case 'rate': return (<div className="flex gap-1">{[1, 2, 3, 4, 5].map(star => (<button key={star} onClick={() => onChange(star)} type="button"><Star size={24} className={`transition-colors ${star <= (value || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 hover:text-yellow-200'}`} /></button>))}</div>);
    case 'array':
      const items = Array.isArray(value) ? value : [];
      return (<div className="space-y-3">{items.map((item, idx) => (<div key={idx} className="border border-gray-200 rounded-lg bg-gray-50/50 relative group overflow-hidden"><div className="bg-gray-100 px-4 py-2 flex justify-between items-center border-b border-gray-200"><span className="text-xs font-bold text-gray-500 uppercase">Item {idx + 1}</span><button onClick={() => onChange(items.filter((_, i) => i !== idx))} className="text-gray-400 hover:text-red-500 transition-colors"><X size={16} /></button></div><div className="p-4 space-y-4">{field.subFields && field.subFields.map(sub => (<div key={sub.id}><label className="block text-xs font-medium text-gray-500 mb-1">{sub.title} {sub.required && <span className="text-red-400">*</span>}</label><DynamicInput field={sub} value={item[sub.id]} onChange={(subValue) => { const newItems = [...items]; newItems[idx] = { ...newItems[idx], [sub.id]: subValue }; onChange(newItems); }} path={`${path}.${idx}.${sub.id}`} errors={errors} />{sub.description && <p className="text-[10px] text-gray-400 mt-1">{sub.description}</p>}{errors[`${path}.${idx}.${sub.id}`] && (<div className="flex items-center gap-1 text-[10px] text-red-500 animate-pulse font-medium mt-1"><AlertCircle size={10} /> {errors[`${path}.${idx}.${sub.id}`]}</div>)}</div>))}</div></div>))}<button type="button" onClick={() => { const newItem = {}; if (field.subFields) { field.subFields.forEach(sub => { newItem[sub.id] = (sub.type === 'switch') ? false : (sub.type === 'number' ? 0 : ''); }); } onChange([...items, newItem]); }} className="w-full flex items-center justify-center gap-2 text-sm text-indigo-600 font-medium px-4 py-3 border border-dashed border-indigo-300 rounded-lg hover:bg-indigo-50 transition-colors"><Plus size={16} /> 添加一项</button></div>);
    default: return (<div className="relative"><input type={field.type === 'number' ? 'number' : 'text'} value={safeValue} onChange={e => onChange(e.target.value)} className={commonClass} placeholder={field.placeholder} maxLength={field.maxLength} />{field.maxLength && <span className="absolute bottom-2 right-2 text-xs text-gray-400 pointer-events-none bg-white px-1 rounded">{safeValue.length}/{field.maxLength}</span>}</div>);
  }
}

// ----------------------------------------------------------------------
// 3. 数据管理
// ----------------------------------------------------------------------
function DataViewer({ user }) {
  const [data, setData] = useState([]);
  const [columns, setColumns] = useState([]);

  useEffect(() => {
    if(!user) return;
    getDoc(doc(db, 'artifacts', appId, 'public', 'data', 'schemas', FORM_ID)).then(snap => {
      if(snap.exists()) {
         const schema = snap.data().schema;
         if(schema && schema.properties) {
           setColumns(Object.keys(schema.properties).map(k => ({ id: k, title: schema.properties[k].title })));
         }
      }
    });
    const q = query(collection(db, 'artifacts', appId, 'public', 'data', `submissions_${FORM_ID}`), orderBy('submittedAt', 'desc'));
    const unsub = onSnapshot(q, snap => {
      setData(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, err => console.log(err));
    return () => unsub();
  }, [user]);

  return (
    <div className="p-8 h-full bg-gray-50 overflow-auto">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2"><Database className="text-purple-600" /> 数据看板</h2>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                <tr><th className="px-6 py-3 w-16">#</th>{columns.map(col => <th key={col.id} className="px-6 py-3 whitespace-nowrap">{col.title}</th>)}<th className="px-6 py-3 text-right">时间</th></tr>
              </thead>
              <tbody>
                {data.length === 0 ? (<tr><td colSpan={columns.length + 2} className="px-6 py-8 text-center text-gray-400">暂无提交数据</td></tr>) : (
                  data.map((row, i) => (
                    <tr key={row.id} className="bg-white border-b hover:bg-gray-50">
                      <td className="px-6 py-4">{i + 1}</td>
                      {columns.map(col => (<td key={col.id} className="px-6 py-4 whitespace-nowrap max-w-xs truncate">{Array.isArray(row.data[col.id]) ? (typeof row.data[col.id][0] === 'object' ? `[${row.data[col.id].length} items]` : row.data[col.id].join(', ')) : String(row.data[col.id] || '-')}</td>))}
                      <td className="px-6 py-4 text-right">{row.submittedAt?.seconds ? new Date(row.submittedAt.seconds * 1000).toLocaleString() : '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}