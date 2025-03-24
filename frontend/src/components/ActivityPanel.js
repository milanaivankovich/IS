
//import './UserProfile.css';

import axios from "axios";

///////komponenta za paginaciju dogadjaja
const ActivityPanel = (activityDataArray, nextPage
    //, fetchingNextPage
) => {
    const [data, setData] = useState(activityDataArray);
    const [next, setNextPage] = useState(nextPage);

    const [isFetchingNextPage, setIsFetchingNextPage] = useState(false);
    //inView paginacija
    const fetchNextPage = async () => {
        setIsFetchingNextPage(true);
        await axios.get(`${next}`) //token todo
            .then((response) => {
                setData((prev) => Array.isArray(prev) ? [...prev, ...response.data.results] : response.data.results);
                setNextPage(response.data?.next ? response.data.next : null);
            })
            .catch((error) =>
                console.error("Greska pri dohvacanju notifikacija"))
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
            {Array.isArray(data) && data.map((activity) => (
                <ActivityCard key={activity.id} activity={activity} />
            ))}
            <div ref={ref} style={{ height: "40px" }}>
                {isFetchingNextPage && <Spinner className='spinner-border' animation="border" />}
            </div>
        </div>);
}

export default ActivityPanel;