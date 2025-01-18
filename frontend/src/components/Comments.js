import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Comments.css";

const Comments = ({ activityId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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
        { text: newComment },
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

  return (
    <div className="comments-section">
      <h4>Komentari</h4>

      <div className="comments-list">
        {comments.length > 0 ? (
          comments.map((comment) => (
            <div key={comment.id} className="comment">
              <p className="comment-text">{comment.text}</p>
              <p className="comment-meta">
                <span className="comment-date">
                  {new Date(comment.date).toLocaleString()}
                </span>{" "}
                -{" "}
                <span className="comment-author">
                  @{comment.client?.username || "Nepoznato"}
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
