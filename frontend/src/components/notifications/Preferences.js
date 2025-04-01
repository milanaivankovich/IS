import React, { useEffect, useState } from "react";
import Switch from '@mui/material/Switch';
import { changePreferences, getNotificationsPreferences } from "./utils";
import axios from "axios";
import API from "../../variables";

//veliki prikaz za activity ili advertisement

const Preferences = ({ userType, userId }) => {
    const [Email, setEmail] = useState(false);
    const [Group, setGroup] = useState(false);

    const changePreferences = async (user_id, user_type) => {
        try {
            const request = await axios.post(`${API}/api/notifications/preferences/${user_type}/${user_id}`,
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

    const handleEmailChange = (event) => {
        setEmail(event.target.checked);
        changePreferences(userId, userType);
    };
    const handleGroupChange = (event) => {
        setGroup(event.target.checked);
        changePreferences(userId, userType);
    };

    useEffect(() => {
        getNotificationsPreferences(userId, userType).
            then((preferences) => {
                setGroup(Boolean(preferences?.group_notifications));
                setEmail(Boolean(preferences?.email_notifications));
            });
    }
        , [])
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
                            color="default"
                            uncontrolled
                        />
                    </td>
                </tr>
            </tbody>
        </table >
    </div >);
}

export default Preferences;