import { useEffect, useState } from 'react'
import { Button } from 'primereact/button'
import { InputText } from 'primereact/inputtext'
import { InputNumber } from 'primereact/inputnumber'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { Menubar } from 'primereact/menubar'

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

  const items = [
    {
      label: 'Opciones',
      icon: 'pi pi-bars',
      items: [
        {
          label: 'Cargar desde LocalStorage',
          icon: 'pi pi-download',
          command: () => setBuscaObjetos(true)
        },
        {
          label: 'Cargar desde API',
          icon: 'pi pi-cloud-download',
          command: () => getObjetos()
        }
      ]
    },
    {
      label: 'Ayuda',
      icon: 'pi pi-question',
      items: [
        {
          label: 'Acerca de',
          icon: 'pi pi-info-circle',
          command: () => alert('App de gestión de objetos')
        }
      ]
    }
  ]

  const guardarLS = (data) => {
    localStorage.setItem("nombreClave", JSON.stringify(data))
  }

  const leerLS = () => {
    const data = localStorage.getItem("nombreClave")
    if (data) {
      setObjetosGuardados(JSON.parse(data))
    }
  }

  const getObjetos = async () => {
    try {
      const response = await fetch('https://api.restful-api.dev/objects')
      const data = await response.json()
      setObjetosGuardados(data)
      guardarLS(data)
    } catch (error) {
      console.error("Error al obtener datos de la API", error)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    if (["features", "price", "year"].includes(name)) {
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
    try {
      const response = await fetch('https://api.restful-api.dev/objects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      if (response.ok) {
        const data = await response.json()
        const nuevosObjetos = [...objetosGuardados, data]
        setObjetosGuardados(nuevosObjetos)
        guardarLS(nuevosObjetos)
        setForm({ name: '', data: { features: '', price: 0, year: 0 } })
      }
    } catch (error) {
      console.error("Error al guardar", error)
    }
  }

  const putForm = async () => {
    try {
      const response = await fetch(`https://api.restful-api.dev/objects/${idEditando}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      if (response.ok) {
        const data = await response.json()
        const listaActualizada = objetosGuardados.map(obj => obj.id === idEditando ? data : obj)
        setObjetosGuardados(listaActualizada)
        guardarLS(listaActualizada)
        cancelarEdicion()
      }
    } catch (error) {
      console.error("Error al actualizar", error)
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
    setForm({ name: '', data: { features: '', price: 0, year: 0 } })
  }

  useEffect(() => {
    if (buscaObjetos) leerLS()
  }, [buscaObjetos])

  return (
    <div className="p-m-4">
      {/* ✅ Menubar arriba */}
      <Menubar model={items} />

      <h2 className="p-mt-3">Lista de Objetos</h2>

      <DataTable value={objetosGuardados} stripedRows paginator rows={5} responsiveLayout="scroll">
        <Column field="name" header="Nombre" />

        {/* ✅ Columna para el precio */}
        <Column
          header="Precio"
          body={(rowData) =>
            rowData.data?.price !== undefined
              ? `$ ${new Intl.NumberFormat('es-AR').format(rowData.data.price)}`
              : 'Sin precio'
          }
        />

        <Column
          header="Acciones"
          body={(rowData) => (
            <>
              <Button icon="pi pi-trash" className="p-button-danger p-button-sm p-mr-2" onClick={() => handleDelete(rowData.id)} />
              <Button icon="pi pi-pencil" className="p-button-warning p-button-sm" onClick={() => activarEdicion(rowData)} />
            </>
          )}
        />
      </DataTable>

      <form onSubmit={handleSubmit} className="p-mt-4 p-fluid">
        <h3>{modoEdicion ? 'Editar objeto' : 'Crear nuevo objeto'}</h3>

        <div className="p-field">
          <label htmlFor="name">Nombre</label>
          <InputText id="name" name="name" value={form.name} onChange={handleInputChange} required />
        </div>

        <div className="p-field">
          <label htmlFor="features">Características</label>
          <InputText id="features" name="features" value={form.data.features} onChange={handleInputChange} required />
        </div>

        <div className="p-field">
          <label htmlFor="price">Precio</label>
          <InputNumber id="price" name="price" value={form.data.price} onValueChange={(e) => handleInputChange({ target: { name: 'price', value: e.value } })} required />
        </div>

        <div className="p-field">
          <label htmlFor="year">Año</label>
          <InputNumber id="year" name="year" value={form.data.year} onValueChange={(e) => handleInputChange({ target: { name: 'year', value: e.value } })} required />
        </div>

        <div className="p-d-flex p-gap-2">
          <Button type="submit" label="Guardar" icon="pi pi-save" />
          {modoEdicion && <Button type="button" label="Cancelar" icon="pi pi-times" className="p-button-secondary" onClick={cancelarEdicion} />}
        </div>
      </form>
    </div>
  )
}

export default App
