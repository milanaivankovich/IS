import React, { useEffect, useState } from "react";
import Switch from '@mui/material/Switch';
import { changePreferences, getNotificationsPreferences } from "./utils";
import axios from "axios";
import API from "../../variables";
import { toast } from "react-toastify";

//veliki prikaz za activity ili advertisement

const Preferences = ({ userType, userId }) => {
    const [Email, setEmail] = useState(null);
    const [Group, setGroup] = useState(null);
    useEffect(() => {
        if (userId !== -1 && userType)
            getNotificationsPreferences(userId, userType).
                then((preferences) => {
                    setGroup(Boolean(preferences?.group_notifications));
                    setEmail(Boolean(preferences?.email_notifications));
                });
    }
        , [])
    return (<>
        {Email !== null && Group !== null && <PreferencesChild userId={userId} userType={userType} email_notifications={Email} group_notifications={Group} />}
    </>)
}

const PreferencesChild = ({ userType, userId, group_notifications, email_notifications }) => {
    const [Email, setEmail] = useState(email_notifications);
    const [Group, setGroup] = useState(group_notifications);

    const changePreferences = async (user_id, user_type) => {
        try {
            const request = await axios.put(`${API}/api/notifications/preferences/${user_type}/${user_id}/`,
                {
                    'email_notifications': Email,
                    'group_notifications': Group
                },
                {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                })
            return request.data?.preferences;
        }
        catch (error) {
            console.error("Error: ", error);
        }
    };

    const handleEmailChange = async (event) => {
        setEmail(event.target.checked);
    };
    const handleGroupChange = (event) => {
        setGroup(event.target.checked);
    };
    useEffect(() => {
        changePreferences(userId, userType);
    }, [Email, Group])

    return (<div style={{ margin: "10px" }}>
        <h2 style={{ margin: "15px" }}>NOTIFIKACIJE</h2>

        <table >
            <tbody>
                <tr>
                    <td>
                        <div>E-mail obavještenja
                            <p>Obavještenje 30 minuta prije nadolazećeg događaja</p>
                        </div>
                    </td>
                    <td style={{ padding: "10px" }}>
                        <Switch
                            checked={Email}
                            onChange={handleEmailChange}
                            color="default"
                        /></td>
                </tr>
                <tr>
                    <td>
                        <div>Grupisanje obavještenja
                            <p>Optimalan prikaz obavještenja istog tipa
                                <br /> (* promjena utiče na već postojeće notifikacije)</p>
                        </div>
                    </td>
                    <td style={{ padding: "10px" }}>
                        <Switch
                            checked={Group}
                            onChange={handleGroupChange}
                            color="default" />
                    </td>
                </tr>
            </tbody>
        </table >
    </div >);
}

export default Preferences;