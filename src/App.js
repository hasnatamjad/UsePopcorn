import { useEffect, useState } from "react";
import StarRating from "./StarRating";

// http://www.omdbapi.com/?i=tt3896198&apikey=b69222f7

const movieKey = "b69222f7";
const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

export default function App() {
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsloading] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");

  const [selectedId, setSelectedId] = useState(null);
  const [watched, setWatched] = useState(function () {
    const storeItem = localStorage.getItem("watched");
    return JSON.parse(storeItem);
  });
  const [movieAdded, setMovieAdded] = useState(false);

  function handleSelectedMovie(id) {
    setSelectedId((selectedId) => (id === selectedId ? null : id));
  }

  function closeMovie() {
    setSelectedId(null);
  }

  function handleAddWatch(movie) {
    setWatched((watched) => [...watched, movie]);
    // localStorage.setItem("watched", JSON.stringify([...watched, movie]));
  }
  function handleMovieAdded() {
    setMovieAdded(true);
  }

  function handleDeleteWatched(id) {
    setWatched((watched) => watched.filter((movie) => movie.imdbId !== id));
  }

  useEffect(
    function () {
      localStorage.setItem("watched", JSON.stringify(watched));
    },
    [watched]
  );

  useEffect(
    function () {
      const controller = new AbortController();

      async function fetchMovies() {
        try {
          setIsloading(true);
          setError("");
          const res = await fetch(
            `http://www.omdbapi.com/?apikey=${movieKey}&s=${query}`,
            { signal: controller.signal }
          );
          if (!res.ok)
            throw new Error("Something went wrong while loading movie");

          const data = await res.json();
          if (data.Response === "False") throw new Error("Movie Not Found🚫");
          setMovies(data.Search);
          setError("");
        } catch (err) {
          if (err.name !== "AbortError") {
            console.log(err.message);
            setError(err.message);
          }
        } finally {
          setIsloading(false);
        }
      }

      if (query.length < 3) {
        setMovies([]);
        setError("");
        return;
      } else {
        closeMovie();
        fetchMovies();

        return function () {
          controller.abort();
        };
      }
    },
    [query]
  );

  return (
    <>
      <Navbar movies={movies} query={query} setQuery={setQuery} />
      <Main>
        <Box>
          {/* {isLoading ? <Loader /> : <MoviesList movies={movies} />} */}
          {isLoading && <Loader />}
          {!isLoading && !error && (
            <MoviesList
              movies={movies}
              onSelectedMovie={handleSelectedMovie}
              onCloseMovie={closeMovie}
            />
          )}
          {error && <ErrorMessage message={error} />}
        </Box>

        <Box>
          {selectedId ? (
            <MovieDetails
              selectedId={selectedId}
              onCloseMovie={closeMovie}
              onAddWatch={handleAddWatch}
              watched={watched}
            />
          ) : (
            <>
              <Summary watched={watched} />

              <WatchedList
                watched={watched}
                onDeleteWatched={handleDeleteWatched}
              />
            </>
          )}
        </Box>
      </Main>
    </>
  );
}

function ErrorMessage({ message }) {
  return (
    <p className="error">
      <span>⛔</span> {message}
    </p>
  );
}

function Loader() {
  return <p className="loader">Loading...</p>;
}

/* =============================================== */

// child of Navbar Component
function Logo() {
  return (
    <div>
      <div className="logo">
        <span role="img">🍿</span>
        <h1>usePopcorn</h1>
      </div>
    </div>
  );
}

// Navbar Component
function Navbar({ movies, query, setQuery }) {
  return (
    <div>
      <nav className="nav-bar">
        <Logo />
        <input
          className="search"
          type="text"
          placeholder="Search movies..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <p className="num-results">
          Found <strong>{movies.length}</strong> results
        </p>
      </nav>
    </div>
  );
}

/* =============================================== */

// Main Component
function Main({ children }) {
  return <main className="main">{children}</main>;
}

function Box({ children }) {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <div className="box">
      <button className="btn-toggle" onClick={() => setIsOpen((open) => !open)}>
        {isOpen ? "–" : "+"}
      </button>
      {isOpen && children}
    </div>
  );
}

function MoviesList({ movies, onSelectedMovie, onCloseMovie }) {
  const filterWords = ["sex", "drug", "porn"];
  const [showMovie, setShowMovie] = useState(false);

  const [filteredMovies, setFilteredMovies] = useState([]);

  // useEffect(() => {
  //   const filtered = movies
  //     .filter((item) => {
  //       const title = item.Title.toLowerCase();
  //       return filterWords.some((word) => title.split(" ").includes(word));
  //     })
  //     .map((movie) => movie.imdbID);

  //   setFilteredMovies(filtered);
  // }, [movies, filterWords, filteredMovies, setFilteredMovies]);

  return (
    <ul className="list">
      {movies?.map((movie) => (
        <Movie
          movie={movie}
          key={movie.imdbID}
          onSelectedMovie={onSelectedMovie}
          onCloseMovie={onCloseMovie}
        />
      ))}
    </ul>
  );
}

function Movie({ movie, showMovie, onSelectedMovie, onCloseMovie }) {
  return (
    <li onClick={() => onSelectedMovie(movie.imdbID)}>
      {showMovie ? (
        <span>Explicit Content🛑 Content is Hidden</span>
      ) : (
        <>
          <img src={movie.Poster} alt={`${movie.Title} poster`} />
          <h3>{movie.Title}</h3>
          <div>
            <p>
              <span>🗓</span>
              <span>{movie.Year}</span>
            </p>
          </div>
        </>
      )}
    </li>
  );
}

function MovieDetails({ selectedId, onCloseMovie, onAddWatch, watched }) {
  const [movieData, setMovieData] = useState({});
  const [movieDataLoading, setMovieDataLoading] = useState(false);
  const [userRating, setUserRating] = useState("");

  const {
    Title: title,
    Poster: poster,
    Year: year,
    Runtime: runtime,
    imdbRating,
    Plot: plot,
    Released: released,
    Actors: actors,
    Director: director,
    Genre: genre,
  } = movieData;
  useEffect(
    function () {
      async function getMovieDetails() {
        setMovieDataLoading(true);
        const res = await fetch(
          `http://www.omdbapi.com/?apikey=${movieKey}&i=${selectedId}`
        );
        const data = await res.json();
        setMovieData(data);
        setMovieDataLoading(false);
      }
      getMovieDetails();
    },
    [selectedId]
  );

  const isWatched = watched.map((movie) => movie.imdbId).includes(selectedId);
  const watchedUserRating = watched.find(
    (movie) => movie.imdbId === selectedId
  )?.userRating;

  function handleAdd(movie) {
    const newWatchedMovie = {
      imdbId: selectedId,
      title,
      poster,
      year,
      imdbRating: Number(imdbRating),
      runtime: Number(runtime.split(" ").at(0)),
      userRating,
    };
    onAddWatch(newWatchedMovie);
    onCloseMovie();
  }

  useEffect(
    function () {
      function callBack(e) {
        if (e.code === "Escape") {
          onCloseMovie();
        }
      }
      document.addEventListener("keydown", callBack);

      return function () {
        document.removeEventListener("keydown", callBack);
      };
    },
    [onCloseMovie]
  );

  useEffect(
    function () {
      if (!title) return;
      document.title = `Movie | ${title}`;

      return function () {
        document.title = "usePopcorn";
      };
    },
    [title]
  );

  return (
    <div className="details">
      {movieDataLoading ? (
        <Loader />
      ) : (
        <>
          <header>
            <img src={poster} alt={`poster of ${title}`} />
            <div className="details-overview">
              <h2>{title}</h2>
              <p>
                {released} &bull; {runtime}
              </p>
              <p>{genre}</p>
              <p>
                <span>⭐</span>
                {imdbRating} IMDB Rating{" "}
              </p>
            </div>
            <button className="btn-back" onClick={onCloseMovie}>
              &larr;
            </button>
          </header>
          <section>
            <div className="rating">
              {!isWatched ? (
                <>
                  <StarRating
                    maxRating={10}
                    size="20"
                    onSetRating={setUserRating}
                  />
                  {userRating > 0 && (
                    <button className="btn-add" onClick={handleAdd}>
                      Add To WatchList
                    </button>
                  )}
                </>
              ) : (
                <p>You rated the movie with {watchedUserRating} 🌟 </p>
              )}
            </div>

            <p>
              <em>{plot}</em>
            </p>
            <p>
              <strong>Staring: </strong>
              {actors}
            </p>
            <p>
              <strong>Director: </strong>
              {director}
            </p>
          </section>
        </>
      )}
    </div>
  );
}

function Summary({ watched }) {
  const newImdbRating = average(watched.map((movie) => movie.imdbRating));
  const avgImdbRating = newImdbRating.toFixed(1);
  const newUserRating = average(watched.map((movie) => movie.userRating));
  const avgUserRating = newUserRating.toFixed(1);
  const newRuntime = average(watched.map((movie) => movie.runtime));
  const avgRuntime = newRuntime.toFixed(1);

  return (
    <div className="summary">
      <h2>Movies you watched</h2>
      <div>
        <p>
          <span>#️⃣</span>
          <span>{watched.length} movies</span>
        </p>
        <p>
          <span>⭐️</span>
          <span>{avgImdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{avgUserRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{avgRuntime} min</span>
        </p>
      </div>
    </div>
  );
}

function WatchedList({ watched, onDeleteWatched }) {
  return (
    <ul className="list">
      {watched.map((movie) => (
        <WatchedMovie movie={movie} onDeleteWatched={onDeleteWatched} />
      ))}
    </ul>
  );
}

function WatchedMovie({ movie, onDeleteWatched }) {
  return (
    <>
      <li key={movie.imdbId}>
        <img src={movie.poster} alt={`${movie.title} poster`} />
        <h3>{movie.title}</h3>
        <div>
          <p>
            <span>⭐️</span>
            <span>{movie.imdbRating}</span>
          </p>
          <p>
            <span>🌟</span>
            <span>{movie.userRating}</span>
          </p>
          <p>
            <span>⏳</span>
            <span>{movie.runtime} min</span>
          </p>
          <button
            className="btn-delete"
            onClick={() => onDeleteWatched(movie.imdbId)}
          >
            X
          </button>
        </div>
      </li>
    </>
  );
}
