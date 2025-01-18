import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Comments.css";
import CreatorImg from "../images/user.svg";

const Comments = ({ activityId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState([]);
  const [usernames, setUsernames] = useState({});
  const [pictures, setPictures] = useState({});

  // Dohvatanje trenutno prijavljenog korisnika
  useEffect(() => {
    const fetchUser = async () => {
      await axios.get(`http://127.0.0.1:8000/api/get-user-type-and-id/`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      })
        .then((request) => {
          setUser(request.data);
        })
        .catch((error) => {
          console.error("Error getting ID: ", error);
          alert("Neuspjesna autorizacija. Molimo ulogujte se... ");
          window.location.replace("/login"); 
        });
    };

    fetchUser();
  }, []);

  // Dohvatanje komentara za aktivnost
  const fetchComments = async () => {
    try {
      const response = await axios.get(
        `http://127.0.0.1:8000/api/comments/${activityId}/`
      );
      setComments(response.data);
    } catch (error) {
      console.error("Greška pri dohvatanju komentara:", error);
    }
  };

  // Slanje novog komentara
  const submitComment = async () => {
    if (!newComment.trim()) {
      alert("Komentar ne može biti prazan!");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Morate biti prijavljeni da biste ostavili komentar.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post(
        `http://127.0.0.1:8000/api/comments/${activityId}/`,
        { text: newComment,
          client: user.id
         },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Dodaj novi komentar na listu
      setComments([...comments, response.data]);
      setNewComment(""); // Resetuj unos
    } catch (error) {
      console.error("Greška pri slanju komentara:", error);
      alert("Došlo je do greške. Pokušajte ponovo.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [activityId]);

  //Dohvati ime korisnika po id-u
  useEffect(() => {
    const fetchUsername = async (clientId) => {
      try {
        const response = await fetch(
          `http://127.0.0.1:8000/api/client/${clientId}/`
        );
        const data = await response.json();
        setUsernames((prev) => ({ ...prev, [clientId]: data.username }));
      } catch (error) {
        console.error("Error fetching username:", error);
      }
    };

    comments.forEach((comment) => {
      if (comment.client && !usernames[comment.client]) {
        fetchUsername(comment.client);
      }
    });
  }, [comments]);
  

    //Dohvati slike korisnika po id-u
    useEffect(() => {
      const fetchPicture = async (clientId) => {
        try {
          const response = await fetch(
            `http://127.0.0.1:8000/api/client/${clientId}/`
          );
          const data = await response.json();
          setPictures((prev) => ({ ...prev, [clientId]: `http://127.0.0.1:8000/` + data.profile_picture }));
        } catch (error) {
          console.error("Error fetching username:", error);
        }
      };
  
      comments.forEach((comment) => {
        if (comment.client && !pictures[comment.client]) {
          fetchPicture(comment.client);
        }
      });
    }, [comments]);


  return (
    <div className="comments-section">
      <h4>Komentari</h4>

      <div className="comments-list">
        {comments.length > 0 ? (
          comments.map((comment) => (
            <div key={comment.id} className="comment">
              <p className="comment-text">{comment.text}</p>
              <img src={pictures[comment.client] !== null ? pictures[comment.client] : CreatorImg} className="creator-image" alt="Creator" />
              <p className="comment-meta">
                <span className="comment-date">
                  {new Date(comment.date).toLocaleString()}
                </span>{" "}
                -{" "}
                <span className="comment-author">
                  @{usernames[comment.client] || "Nepoznato"}
                </span>
              </p>
            </div>
          ))
        ) : (
          <p className="no-comments">Nema komentara za ovu aktivnost.</p>
        )}
      </div>

      <div className="add-comment">
        <textarea
          placeholder="Dodajte komentar..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          rows="3"
          disabled={isLoading}
        ></textarea>
        <button
          onClick={submitComment}
          disabled={isLoading || !newComment.trim()}
        >
          {isLoading ? "Slanje..." : "Pošalji"}
        </button>
      </div>
    </div>
  );
};

export default Comments;
