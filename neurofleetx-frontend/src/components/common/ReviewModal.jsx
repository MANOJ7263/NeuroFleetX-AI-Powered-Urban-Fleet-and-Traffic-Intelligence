import { useState } from "react";
import { submitReview } from "../../services/reviewService";

const ReviewModal = ({ isOpen, onClose, vehicleId, onSuccess }) => {
    const [rating, setRating] = useState(5);
    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            await submitReview({ vehicleId, rating: parseInt(rating), content });
            alert("Review submitted successfully!");
            if (onSuccess) onSuccess();
            onClose();
        } catch (err) {
            console.error(err);
            setError("Failed to submit review.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
            <div className="card" style={{ width: '400px', position: 'relative' }}>
                <button
                    onClick={onClose}
                    style={{ position: 'absolute', top: '10px', right: '10px', background: 'transparent', border: 'none', color: '#fff', fontSize: '1.2rem', cursor: 'pointer' }}>
                    &times;
                </button>
                <h3>Rate Your Trip</h3>
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '15px' }}>
                        <label>Rating</label>
                        <select
                            value={rating}
                            onChange={(e) => setRating(e.target.value)}
                            style={{ width: '100%', padding: '10px', background: '#333', color: '#fff', border: 'none', borderRadius: '5px' }}>
                            <option value="5">⭐⭐⭐⭐⭐ (Excellent)</option>
                            <option value="4">⭐⭐⭐⭐ (Good)</option>
                            <option value="3">⭐⭐⭐ (Average)</option>
                            <option value="2">⭐⭐ (Poor)</option>
                            <option value="1">⭐ (Terrible)</option>
                        </select>
                    </div>
                    <div style={{ marginBottom: '15px' }}>
                        <label>Comment</label>
                        <textarea
                            rows="4"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="How was your experience?"
                            disabled={loading}
                            style={{ width: '100%', padding: '10px', background: '#333', color: '#fff', border: 'none', borderRadius: '5px', resize: 'vertical' }}
                        />
                    </div>
                    {error && <p className="error" style={{ marginBottom: '10px' }}>{error}</p>}
                    <button type="submit" disabled={loading} style={{ width: '100%' }}>
                        {loading ? "Submitting..." : "Submit Review"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ReviewModal;
