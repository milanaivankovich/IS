import React, { useEffect, useState } from "react";
import "./CommentsSection.css";
import Comments from "./Comments";
import { IoIosCloseCircle } from "react-icons/io";


const CommentsSection = ({ id, closeFunction }) => {
    return (
        <div className='comments-section-dimmer'>
            <div className="comments-section-card">
                <IoIosCloseCircle className="comments-section-close-icon" onClick={closeFunction} />
                <div className="comments-section-body">
                    <Comments activityId={id} />
                </div>
            </div>
        </div>
    );
};

export default CommentsSection;