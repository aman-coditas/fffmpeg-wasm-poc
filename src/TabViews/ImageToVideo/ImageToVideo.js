import React, { useState } from "react";
import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";

function ImageToVideo() {
  const [slateName, setSlateName] = useState("");
  const [image, setImage] = useState();
  const [duration, setDuration] = useState(2);
  const [videoSrc, setVideoSrc] = useState("");
  const [message, setMessage] = useState("Click Start to transcode");

  const ffmpeg = createFFmpeg({
    log: true
  });

  // slate name change handler
  const handleSlateNameChange = (e) => {
    if (e.target.value) {
      setSlateName(e.target.value);
    }
  };

  // image selection handler
  const handleImageFileChange = (e) => {
    if (e.target.files) {
      setImage(e.target.files[0]);
    }
  };

  // duration change handler
  const handleDurationChange = (e) => {
    if (e.target.value) {
      setDuration(e.target.value);
    }
  };

  // process to convert image to video
  const imgToVid = async () => {
    console.log('image: ', image);

    setMessage("Loading ffmpeg-core.js");
    
    // loading FFMPEG core
    await ffmpeg.load();

    setMessage("Loading data");

    // writing input image to FFMPEG worker
    ffmpeg.FS("writeFile", `test.png`, await fetchFile("https://png.pngitem.com/pimgs/s/185-1850014_free-sample-hd-png-download.png"));

    setMessage("Transcoding in progress...");

    await ffmpeg.run(
      "-loop",
      "1",
      "-i",
      "test.png",
      "-c:v",
      "libx264",
      "-t",
      `${duration}`,
      "-pix_fmt",
      "yuv420p",
      "-vf",
      "scale=1280:720",
      "out.mp4"
    );

    // reading output video from FFMPEG worker
    const data = ffmpeg.FS("readFile", "out.mp4");

    // removing input image from FFMPEG worker
    ffmpeg.FS("unlink", `test.png`);

    // converting output video to blob
    const blob = new Blob([data.buffer], { type: "video/mp4" });

    // converting blob to file
    const file = await fetch(blob).then(blobFile => new File([blobFile], `${slateName}`, { type: "video/mp4" }));

    setVideoSrc(URL.createObjectURL(blob));
    setMessage("Transcoding complete");

    console.log('file: ', file);
  };

  return (
    <div className="App">
        <div className="container">
            <div className="row">
                <div className="col-6">
                    <p>Slate Name:</p>
                    <input type="text" value={slateName} onChange={handleSlateNameChange}></input>
                    <br /><br />
                    <p>Image:</p>
                    <input type="file" onChange={handleImageFileChange}></input>
                    <br /><br />
                    <p>Duration:</p>
                    <input type="number" value={duration} onChange={handleDurationChange}></input>
                    <br /><br />
                    <button onClick={imgToVid}>Start</button>
                    <p>{message}</p>
                </div>
                <div className="col-6">
                    <video width={480} src={videoSrc} controls></video>
                </div>
            </div>
        </div>
    </div>
  );
}

export default ImageToVideo;
