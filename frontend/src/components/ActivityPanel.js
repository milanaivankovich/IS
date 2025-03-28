
//import './UserProfile.css';

import axios from "axios";
import { useState } from "react";
import { useInView } from "react-intersection-observer";
import ActivityCard from "./ActivityCard";
import { Spinner } from "react-bootstrap";
import SponsoredEventCard from "./SponsoredEventCard";

///////komponenta za paginaciju dogadjaja, tip=[activities, advertisements]
const ActivityPanel = ({ activityDataArray, nextPage, variant }) => {
    const [data, setData] = useState(activityDataArray);
    const [next, setNextPage] = useState(nextPage);

    const [isFetchingNextPage, setIsFetchingNextPage] = useState(false);
    //inView paginacija
    const fetchNextPage = async () => {
        setIsFetchingNextPage(true);
        await axios.get(`${next}`) //token todo
            .then((response) => {
                setData((prev) => Array.isArray(prev) ? [...prev, ...response.data.results] : response.data?.results);
                setNextPage(response.data?.next ? response.data.next : null);
            })
            .catch((error) =>
                console.error("Greska pri dohvacanju aktivnosti: " + error))
            .finally(() =>
                setIsFetchingNextPage(false));
    };

    const { ref } = useInView({
        threshold: 1,
        onChange: (inView) => {
            if (inView && next) fetchNextPage();
        }
    });

    return (
        <div className="scroll-bar-user-profile">
            {variant === "activities" ? (

                Array.isArray(data) && data.map((activity) => (
                    <ActivityCard key={activity.id} activity={activity} />
                ))

            ) : (
                variant === "advertisements" ? (
                    Array.isArray(data) && data.map((activity) => (
                        <SponsoredEventCard key={activity.id} event={activity} />
                    ))

                ) : console.error("Please select valid object variant=[activities, advertisements]. Error missing ActivityPanel props: ", variant)
            )}
            <div ref={ref} style={{ width: "40px" }}>
                {isFetchingNextPage && <Spinner className='spinner-border' animation="border" />}
            </div>
        </div>);

}

export default ActivityPanel;