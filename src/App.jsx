import { useEffect, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [buscaObjetos , setBuscaObjetos] = useState(false)
  const [objetosGuardados , setObjetosGuardados] = useState([])
  const [ form , setForm] = useState(
    {
      "name": "",
      "data": {
        "features": "",
        "price": 0,
        "year": 0
      }
    }
  )


  const guardarLS = (data) => {
    localStorage.setItem("nombreClave", JSON.stringify(data));
  };

  const leerLS = () => {
    const data = localStorage.getItem("nombreClave");
    return data ? setObjetosGuardados([JSON.parse(data)]) : [];
  };
  console.log(objetosGuardados)
  const getObjetos = async () => {
    const response = await fetch('https://api.restful-api.dev/objects');
    const data = await response.json(); 
           
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    
    if (['features', 'price', 'year'].includes(name)) {
      setForm((prevForm) => ({
        ...prevForm,
        data: {
          ...prevForm.data,
          [name]: name === 'price' || name === 'year' ? Number(value) : value
        }
      }));
    } else {
   
      setForm((prevForm) => ({
        ...prevForm,
        [name]: value
      }));
    }
  };

  const postForm = async () =>{
    const response = await fetch('https://api.restful-api.dev/objects', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(form)
  
    })
    if (response.ok) {
      const data = await response.json()

      console.log(data);
      
      setTimeout(()=>
        setObjetosGuardados([...objetosGuardados,data])
        
        ,2000)   
        console.log(objetosGuardados);
           
    guardarLS(objetosGuardados);  
      alert('Objeto guardado correctamente');
      setForm({
        name: '',
        data: { features: '', price: 0, year: 0 }
      });
    } else {
      alert('Error al guardar');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await postForm();
  };
  

  useEffect(() => {
    const obtenerYLeer = async () => {
      if (buscaObjetos) {
        leerLS()

      }
    };

    obtenerYLeer();
  }, [buscaObjetos]);

  return (
    <div>
      <h1>Lista de objetos</h1>
      <button onClick={()=> setBuscaObjetos(true)}>Buscar</button>

      <table>
        <thead>
          <tr>
            <th>nombre</th>
          </tr>
        </thead>
        <tbody>
            {objetosGuardados?.map((objeto) => (
              <tr key={objeto.id}>
                <td>{objeto.name}</td>
              </tr>
            )
            )}
        </tbody>
      </table>

      <div>
      <form onSubmit={handleSubmit}>
          <label htmlFor="name">Nombre:</label>
          <input
            type="text"
            id="name"
            name="name"
            value={form.name}
            onChange={handleInputChange}
            required
          /><br />

          <label htmlFor="features">Características:</label>
          <input
            type="text"
            id="features"
            name="features"
            value={form.data.features}
            onChange={handleInputChange}
            required
          /><br />

          <label htmlFor="price">Precio:</label>
          <input
            type="number"
            id="price"
            name="price"
            value={form.data.price}
            onChange={handleInputChange}
            required
          /><br />

          <label htmlFor="year">Año:</label>
          <input
            type="number"
            id="year"
            name="year"
            value={form.data.year}
            onChange={handleInputChange}
            required
          /><br />

          <button type="submit">Guardar</button>
        </form>
      </div>

  </div>
  )
}
export default App
