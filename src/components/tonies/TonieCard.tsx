import React, { useState } from 'react';
import { Card, Button, Popover, message, Slider } from 'antd';
import { InfoCircleOutlined, PlayCircleOutlined, PauseCircleOutlined, RetweetOutlined, EditOutlined } from '@ant-design/icons';

const { Meta } = Card;


export type TagsTonieCardList = {
    tags: TonieCardProps[];
}
export type TonieCardProps = {
    uid: string;
    ruid: string;
    type: string;
    valid: boolean;
    exists: boolean;
    live: boolean;
    nocloud: boolean;
    source: string;
    audioUrl: string;
    tonieInfo: {
        series: string;
        episode: string;
        model: string;
        picture: string;
        tracks: string[];
    };
}

export const TonieCard: React.FC<{ tonieCard: TonieCardProps }> = ({ tonieCard }) => {
    const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
    const [isLive, setIsLive] = useState(tonieCard.live);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);

    const handleLiveClick = () => {
        setIsLive(!isLive);
        if (!isLive) {
            message.success('Live enabled!');
        } else {
            message.success('Live disabled!');
        }
    };
    const handlePlayPauseClick = () => {
        if (audio) {
            if (isPlaying) {
                audio.pause();
            } else {
                audio.play();
            }
            setIsPlaying(!isPlaying);
        } else {
            playAudio();
        }
    };

    const playAudio = async () => {
        const response = await fetch(tonieCard.audioUrl);
        const arrayBuffer = await response.arrayBuffer();
        const blob = new Blob([arrayBuffer.slice(4096)], { type: 'audio/ogg; codecs=opus' }); // Skip the first 4096 bytes
        const audioUrl = URL.createObjectURL(blob);

        const newAudio = new Audio(audioUrl);
        setAudio(newAudio);
        newAudio.onended = () => setIsPlaying(false); // Update state when audio ends
        newAudio.ontimeupdate = () => {
            const playProgress = newAudio.currentTime;// / newAudio.duration;
            setProgress(playProgress); // Update the progress state based on play progress
        };
        newAudio.play();
        setIsPlaying(true);
    };
    const formatDuration = (value: any) => {
        const seconds = Math.round(value);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds - (minutes * 60);
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    };
    const formatter = (value: any) => `${formatDuration(value)}`;

    const content = (
        <div>
            <p><strong>Model:</strong> {tonieCard.tonieInfo.model}</p>
            <p><strong>Valid:</strong> {tonieCard.valid ? 'Yes' : 'No'}</p>
            <p><strong>Exists:</strong> {tonieCard.exists ? 'Yes' : 'No'}</p>
            <ol>
                {tonieCard.tonieInfo.tracks.map((track) => (
                    <li>{track}</li>
                ))}
            </ol>
        </div>
    );
    const title = `${tonieCard.tonieInfo.series} - ${tonieCard.tonieInfo.episode}`;
    const more = (
        <Popover content={content} title={`${tonieCard.tonieInfo.episode}`} trigger="click" placement="bottomRight">
            <Button icon={<InfoCircleOutlined />} />
        </Popover>
    )
    return (
        <Card
            extra={more}
            hoverable
            size="small"
            title={tonieCard.tonieInfo.series}
            cover={<img alt={`${tonieCard.tonieInfo.series} - ${tonieCard.tonieInfo.episode}`} src={tonieCard.tonieInfo.picture} />}
            actions={[
                <EditOutlined key="edit" />,
                tonieCard.valid ?
                    (isPlaying ? <PauseCircleOutlined key="playpause" onClick={handlePlayPauseClick} /> : <PlayCircleOutlined key="playpause" onClick={handlePlayPauseClick} />) :
                    <PlayCircleOutlined key="playpause" style={{ color: 'lightgray' }} />,
                <RetweetOutlined key="live" style={{ color: isLive ? 'red' : 'lightgray' }} onClick={handleLiveClick} />
            ]}
        >
            <Meta title={`${tonieCard.tonieInfo.episode}`} description={tonieCard.uid} />
            <Slider
                min={0}
                max={audio ? audio.duration : 1}
                value={progress}
                step={1}
                tooltip={{ formatter }}
            />
        </Card>
    );
};