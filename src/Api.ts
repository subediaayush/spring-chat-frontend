import axios from "axios";
import { useState } from "react";
import { TargetMessage } from "./TargetMessage";

export const useApi = () => {
    const host = 'localhost:14000'

    const [targetId, setTargetId] = useState<string>();

    const getUserId = async () => {
        var userId = sessionStorage.getItem('userId')
        if (!userId) {
            userId = (await axios.get(`${host}/api/createUser`)).data as string;
            sessionStorage.setItem('userId', userId);
        }

        return userId;
    }

    const sendTargetId = async (target: string) => {
        setTargetId(() => target);
        var userId = sessionStorage.getItem('userId')
        var data: TargetMessage = { user: userId, target: target }
        await axios.post(`${host}/api/target/set`, data)
    }

    const sendMessage = async (message: string) => {
        var userId = sessionStorage.getItem('userId') ?? ''
        var target = targetId ?? ''
        var data: ChatMessage = { from: userId, to: target, message: message, timestamp: new Date().getUTCMilliseconds(), bucket: '' }
        await axios.post(`${host}/api/message/send`, data)
    }

    return [getUserId, sendTargetId, sendMessage]
}