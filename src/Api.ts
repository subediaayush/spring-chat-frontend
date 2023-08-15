import axios from "axios";
import { useState } from "react";
import { ChatMessage } from "./Message";

export const useApi = () => {
    const host = 'http://localhost:14000'

    const [targetId, setTargetId] = useState<string>();

    const getUserId = async () => {
        var uid = localStorage.getItem('userId')
        if (!uid) {
            console.log("Querying user id")
            uid = (await axios.get(`${host}/api/user/create`)).data as string;
            console.log("User id obtained", uid)
            localStorage.setItem('userId', uid);
            console.log("User id saved", uid)
        }

        return uid ?? '';
    }

    const getMessages = async (target: string) => {
        console.log("Getting messages for target", target)
        setTargetId(() => target);
        var userId = localStorage.getItem('userId')
        return (await axios.get(`${host}/api/message/get?u1=${userId}&u2=${target}`)).data
    }

    const getMessage = (message: string) => {
        var userId = localStorage.getItem('userId') ?? ''
        var target = targetId ?? ''
        var data: ChatMessage = { from: userId, to: target, message: message, timestamp: new Date().getUTCMilliseconds(), bucket: '' }
        console.log(data)
        return data
    }

    return { getUserId, getMessages, getMessage }
}