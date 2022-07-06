import { MagnifyingGlass } from 'phosphor-react'
import { useMemo } from 'react'
import { useEffect, useState, useRef } from 'react'
import MoonLoader from 'react-spinners/MoonLoader'
import SyncLoader from 'react-spinners/SyncLoader'

const App = () => {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [images, setImages] = useState([])
  const gridContainerRef = useRef()

  const handleChange = (e) => {
    setSearch(e.target.value)
  }

  const handleSearch = async (e) => {
    try {
      setIsLoading(true)
      e.preventDefault()
      if (!search) return

      const res = await fetch(
        `https://api.pexels.com/v1/search?page=${page}&query=${search}&per_page=9`,
        {
          headers: {
            Authorization: import.meta.env.VITE_PEXELS_API_KEY,
          },
        },
      )

      const actualData = await res.json()

      setImages(actualData.photos)
    } catch (err) {
      console.log(err)
    } finally {
      setIsLoading(false)
    }
  }

  const goToNextPage = async () => {
    try {
      setIsLoading(true)
      const nextPage = page + 1

      const res = await fetch(
        `https://api.pexels.com/v1/search?page=${nextPage}&query=${search}&per_page=9`,
        {
          headers: {
            Authorization: import.meta.env.VITE_PEXELS_API_KEY,
          },
        },
      )

      const actualData = await res.json()

      setImages((prevImages) => [...prevImages, ...actualData.photos])
      setPage(nextPage)
    } catch (err) {
      console.log(err)
    } finally {
      setIsLoading(false)
    }
  }

  const searchTitle = useMemo(() => {
    return (
      <h2 className="text-sm italic underline mb-2 text-pink-500">
        {search[0]?.toUpperCase() + search?.slice(1) + ' Images'}
      </h2>
    )
  }, [images])

  useEffect(() => {
    if (images.length !== 0) {
      const options = {
        thresholds: 0.5,
      }

      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          const intersecting = entry.isIntersecting

          intersecting &&
            goToNextPage(() => {
              observer.unobserve(gridContainerRef.current.lastChild)
            })
        })
      }, options)

      observer.observe(gridContainerRef.current.lastChild)
    }
  }, [images])

  return (
    <>
      <main>
        <div className="max-w-[1000px] mx-auto">
          <h1 className="font-bold mt-10 text-3xl">Find images 🖼️</h1>
          <form
            onSubmit={handleSearch}
            className="mt-6 w-96 relative bg-gray-100 rounded-lg inline-block"
          >
            <input
              value={search}
              onChange={handleChange}
              className="py-3 text-lg w-full bg-transparent outline-none px-4"
              type="text"
              placeholder="Search for images"
            />
            <button
              type="submit"
              className="absolute text-xl px-4 hover:scale-125 text-gray-500 transition hover:text-pink-500 right-0 h-full"
            >
              <MagnifyingGlass />
            </button>
          </form>
          <SyncLoader
            color="#f9a8d4"
            loading={isLoading && images.length === 0}
            className="mt-8"
          />
          <section className="py-4">
            {images.length !== 0 && searchTitle}
            <div ref={gridContainerRef} className="grid grid-cols-3 gap-4">
              {images.map((image) => (
                <a
                  key={image.id}
                  className="rounded shadow duration-200 hover:shadow-pink-500 overflow-hidden"
                  target="__blank"
                  href={image.url}
                >
                  <img
                    className="max-h-80 object-cover duration-200 hover:scale-105 transition-transform object-center w-full h-full"
                    src={image.src?.medium}
                    alt={image.alt}
                  />
                </a>
              ))}
            </div>
            <div className="flex justify-center mt-4 items-center w-full">
              <MoonLoader
                color="#ec4899"
                loading={isLoading && images.length !== 0}
              />
            </div>
          </section>
        </div>
      </main>
    </>
  )
}

export default App
