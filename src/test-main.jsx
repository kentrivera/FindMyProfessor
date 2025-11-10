import React from 'react'
import ReactDOM from 'react-dom/client'

const SimpleTest = () => {
  return (
    <div style={{ padding: '50px', fontFamily: 'Arial' }}>
      <h1 style={{ color: 'green', fontSize: '48px' }}>✓ REACT IS WORKING!</h1>
      <p style={{ fontSize: '24px' }}>If you see this, React is rendering correctly.</p>
      <button 
        onClick={() => alert('Click works!')}
        style={{ padding: '10px 20px', fontSize: '18px', cursor: 'pointer' }}
      >
        Test Click
      </button>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(<SimpleTest />)
