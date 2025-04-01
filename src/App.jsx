import { useEffect, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [buscaObjetos , setBuscaObjetos] = useState(false)
  const [objetosGuardados , setObjetosGuardados] = useState([])


  const guardarLS = (data) => {
    localStorage.setItem("nombreClave", JSON.stringify(data));
  };

  const leerLS = () => {
    const data = localStorage.getItem("nombreClave");
    return data ? JSON.parse(data) : null;
  };
  
  const getObjetos = async () => {
    const response = await fetch('https://api.restful-api.dev/objects');
    const data = await response.json();       
    guardarLS(data);         
  };
  

  useEffect(() => {
    const obtenerYLeer = async () => {
      if (buscaObjetos) {
        await getObjetos();
        setObjetosGuardados(leerLS());
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
            {objetosGuardados.map((objeto) => (
              <tr key={objeto.id}>
                <td>{objeto.name}</td>
              </tr>
            )
            )}
        </tbody>
      </table>
    </div>
   
  )
}

export default App
