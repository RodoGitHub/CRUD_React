import { useEffect, useState } from 'react'
import './App.css'

function App() {
  const [buscaObjetos, setBuscaObjetos] = useState(false)
  const [objetosGuardados, setObjetosGuardados] = useState([])
  const [form, setForm] = useState({
    name: '',
    data: {
      features: '',
      price: 0,
      year: 0
    }
  })

  const guardarLS = (data) => {
    localStorage.setItem("nombreClave", JSON.stringify(data))
  }

  const leerLS = () => {
    const data = localStorage.getItem("nombreClave")
    return data ? setObjetosGuardados(JSON.parse(data)) : []
  }

  const getObjetos = async () => {
    const response = await fetch('https://api.restful-api.dev/objects')
    const data = await response.json()
    setObjetosGuardados(data)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    if (['features', 'price', 'year'].includes(name)) {
      setForm((prevForm) => ({
        ...prevForm,
        data: {
          ...prevForm.data,
          [name]: name === 'price' || name === 'year' ? Number(value) : value
        }
      }))
    } else {
      setForm((prevForm) => ({
        ...prevForm,
        [name]: value
      }))
    }
  }

  const postForm = async () => {
    const response = await fetch('https://api.restful-api.dev/objects', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(form)
    })

    if (response.ok) {
      const data = await response.json()
      const nuevosObjetos = [...objetosGuardados, data]
      setObjetosGuardados(nuevosObjetos)
      guardarLS(nuevosObjetos)
      alert('Objeto guardado correctamente')
      setForm({
        name: '',
        data: { features: '', price: 0, year: 0 }
      })
    } else {
      alert('Error al guardar')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    await postForm()
  }

  const eliminarObjeto = async (id) => {
    try {
      const response = await fetch(`https://api.restful-api.dev/objects/${id}`, {
        method: 'DELETE'
      })
      if (response.ok) {
        const nuevaLista = objetosGuardados.filter(obj => obj.id !== id)
        setObjetosGuardados(nuevaLista)
        guardarLS(nuevaLista)
      } else {
        console.error('No se pudo eliminar el objeto')
      }
    } catch (error) {
      console.error('Error al eliminar el objeto:', error)
    }
  }

  const handleDelete = (id) => {
    eliminarObjeto(id)
  }

  useEffect(() => {
    const obtenerYLeer = async () => {
      if (buscaObjetos) {
        leerLS()
      }
    }
    obtenerYLeer()
  }, [buscaObjetos])

  return (
    <div>
      <h1>Lista de objetos</h1>

      <div className="form-buttons center">
        <button onClick={() => setBuscaObjetos(true)}>Buscar desde LocalStorage</button>
      </div>

      <table>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Eliminar</th>
          </tr>
        </thead>
        <tbody>
          {objetosGuardados?.map((objeto) => (
            <tr key={objeto.id}>
              <td>{objeto.name}</td>
              <td>
                <button onClick={() => handleDelete(objeto.id)}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="formulario">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Nombre:</label>
            <input
              type="text"
              id="name"
              name="name"
              value={form.name}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="features">Características:</label>
            <input
              type="text"
              id="features"
              name="features"
              value={form.data.features}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="price">Precio:</label>
            <input
              type="number"
              id="price"
              name="price"
              value={form.data.price}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="year">Año:</label>
            <input
              type="number"
              id="year"
              name="year"
              value={form.data.year}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-buttons">
            <button type="submit">Guardar</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default App

