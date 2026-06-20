const fs = require('fs');
const file = 'c:/Users/Administrator/Desktop/Sistema de Gestion/frontend/src/pages/recursos_humanos/TiposNominas.jsx';
let content = fs.readFileSync(file, 'utf8');

const inputGroupStr = `const InputGroup = ({ label, name, type="text", options=[], width="100%", isRequired=false, disabled=false, value, onChange }) => (
  <div style={{ marginBottom: '12px', width }}>
    <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: '#475569' }}>{label} {isRequired && '*'}</label>
    {type === 'select' ? (
      <select name={name} value={value} onChange={onChange} disabled={disabled} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1', backgroundColor: disabled ? '#f1f5f9' : '#fff' }}>
        <option value="">Seleccione...</option>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    ) : type === 'checkbox' ? (
      <input type="checkbox" name={name} checked={!!value} onChange={onChange} disabled={disabled} style={{ transform: 'scale(1.2)' }} />
    ) : (
      <input type={type} name={name} value={value || ''} onChange={onChange} disabled={disabled} maxLength={type==='text'?200:undefined} required={isRequired} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1', backgroundColor: disabled ? '#f1f5f9' : '#fff' }} />
    )}
  </div>
);

`;

// Remove original InputGroup
content = content.replace(/const InputGroup = \(\{[\s\S]*?\n  \);\n/, '');

// Prepend InputGroup outside
content = content.replace('const TiposNominas = () => {', inputGroupStr + 'const TiposNominas = () => {');

// Add value and onChange to all InputGroup usages
content = content.replace(/<InputGroup([^>]*?)name="([a-zA-Z0-9_]+)"([^>]*?)\/>/g, (match, p1, p2, p3) => {
    if (match.includes('onChange=')) return match;
    return `<InputGroup${p1}name="${p2}"${p3} value={formData.${p2}} onChange={handleChange} />`;
});

fs.writeFileSync(file, content);
console.log('Fixed focus issue in TiposNominas.jsx');
