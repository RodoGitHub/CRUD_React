import { useEffect, useState } from 'react'
import './App.css'

function App() {
  const [buscaObjetos, setBuscaObjetos] = useState(false)
  const [objetosGuardados, setObjetosGuardados] = useState([])
  const [modoEdicion, setModoEdicion] = useState(false)
  const [idEditando, setIdEditando] = useState(null)
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

  const putForm = async () => {
    const response = await fetch(`https://api.restful-api.dev/objects/${idEditando}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(form)
    })

    if (response.ok) {
      const data = await response.json()
      const listaActualizada = objetosGuardados.map(obj =>
        obj.id === idEditando ? data : obj
      )
      setObjetosGuardados(listaActualizada)
      guardarLS(listaActualizada)
      alert('Objeto actualizado correctamente')
      cancelarEdicion()
    } else {
      alert('Error al actualizar')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (modoEdicion) {
      await putForm()
    } else {
      await postForm()
    }
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

  const activarEdicion = (objeto) => {
    setModoEdicion(true)
    setIdEditando(objeto.id)
    setForm({
      name: objeto.name || '',
      data: {
        features: objeto.data?.features || '',
        price: objeto.data?.price || 0,
        year: objeto.data?.year || 0
      }
    })
  }

  const cancelarEdicion = () => {
    setModoEdicion(false)
    setIdEditando(null)
    setForm({
      name: '',
      data: { features: '', price: 0, year: 0 }
    })
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
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {objetosGuardados?.map((objeto) => (
            <tr key={objeto.id}>
              <td>{objeto.name}</td>
              <td>
                <button onClick={() => handleDelete(objeto.id)}>Eliminar</button>
                <button onClick={() => activarEdicion(objeto)}>Editar</button>
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

          {modoEdicion && (
            <div className="form-buttons">
              <button type="button" onClick={cancelarEdicion}>Cancelar</button>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}

export default App
