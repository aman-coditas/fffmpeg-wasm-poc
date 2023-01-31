import React, { useState, useRef, useEffect} from "react";
import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";
import { Canvg } from 'canvg';

function SvgToVideo() {
    const [slateName, setSlateName] = useState("");
	const [canvasBgColor, setCanvasBgColor] = useState("white");
	const [title, setTitle] = useState("");
	const [subTitle, setSubTitle] = useState("");
	const [duration, setDuration] = useState(2);

    const [imageSrc, setImageSrc] = useState("");
	const [videoSrc, setVideoSrc] = useState("");
	const [message, setMessage] = useState("Click Start to transcode");

	const canvasRef = useRef(null);
	const svgRef = useRef(null);

	const ffmpeg = createFFmpeg({
		log: true
	});

	// slate name change handler
	const handleSlateNameChange = (e) => {
		if (e.target.value) {
		  setSlateName(e.target.value);
		}
	};

	// canvas background color change handler
	const handleCanvasBgColorChange = (color) => {
		setCanvasBgColor(color);
	}

	// title change handler
	const handleTitleChange = (e) => {
		if (e.target.value) {
		  	setTitle(e.target.value);
		}
		
	};

	// sub title change handler
	const handleSubTitleChange = (e) => {
		if (e.target.value) {
		  setSubTitle(e.target.value);
		}
	};

	// duration change handler
	const handleDurationChange = (e) => {
		if (e.target.value) {
		  setDuration(e.target.value);
		}
	};

    const canvasToVid = async () => {
        const canvas = canvasRef.current;
		var ctx = canvas.getContext("2d");

        var svgElement = svgRef.current;
        let { width, height  } = svgElement.getBBox(); 
		
        let clonedSvgElement = svgElement.cloneNode(true);

        let outerHTML = clonedSvgElement.outerHTML;

        console.log('outerHTML: ', outerHTML);

        const convertToCanvas = await Canvg.from(ctx, outerHTML);
        convertToCanvas.start();

        const imageDataUrl = canvas.toDataURL();
		console.log('imageDataUrl: ', imageDataUrl);

        setMessage("Loading ffmpeg-core.js");
    
		// loading FFMPEG core
		await ffmpeg.load();

		setMessage("Loading data");

		// writing input image to FFMPEG worker
		ffmpeg.FS("writeFile", `test.png`, await fetchFile(imageDataUrl));

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
		"scale=1024:576",
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

    }

	return (
		<div className="App">
			<div className="container">
				<div className="row">
					<div className="col-6">
						<p>Slate Name:</p>
						<input type="text" value={slateName} onChange={handleSlateNameChange}></input>
						<br /><br />
						<p>Background:</p>
						<div className="d-flex justify-content-start">
							<span style={{ width: "36px", height: "36px", backgroundColor: "#f7c6c6", cursor: "pointer", border:"1px solid #d3d3d3" }} onClick={() => handleCanvasBgColorChange("#f7c6c6")}></span>&nbsp;&nbsp;
							<span style={{ width: "36px", height: "36px", backgroundColor: "#c6e0f7", cursor: "pointer", border:"1px solid #d3d3d3" }} onClick={() => handleCanvasBgColorChange("#c6e0f7")}></span>&nbsp;&nbsp;
							<span style={{ width: "36px", height: "36px", backgroundColor: "#caf7c6", cursor: "pointer", border:"1px solid #d3d3d3" }} onClick={() => handleCanvasBgColorChange("#caf7c6")}></span>&nbsp;&nbsp;
							<span style={{ width: "36px", height: "36px", backgroundColor: "#f7f3c6", cursor: "pointer", border:"1px solid #d3d3d3" }} onClick={() => handleCanvasBgColorChange("#f7f3c6")}></span>
						</div>
						<br /><br />
						<p>Title:</p>
						<input type="text" onChange={handleTitleChange}></input>
						<br /><br />
						<p>Subtitle:</p>
						<input type="text" value={subTitle} onChange={handleSubTitleChange}></input>
						<br /><br />
						<p>Duration:</p>
						<input type="number" value={duration} onChange={handleDurationChange}></input>
						<br /><br />
						<button onClick={canvasToVid}>Start</button>
						<p>{message}</p>
					</div>
					<div className="col-6">
						<svg ref={svgRef} width={480} height={240}>
							<rect width={480} height={240} 
							style={{ fill: canvasBgColor, strokeWidth: 1, stroke: "rgb(0,0,0)" }} />
							<text fill="#000000" fontSize="24" fontFamily="Verdana" x={"50%"} y={"50%"} dominantBaseline="middle" textAnchor="middle">{title}</text>
							<text fill="#000000" fontSize="16" fontFamily="Verdana" x={"50%"} y={"60%"} dominantBaseline="middle" textAnchor="middle">{subTitle}</text>
							Sorry, your browser does not support inline SVG.
						</svg><br /><br />
						<canvas ref={canvasRef} width={480} height={240} style={{ border:"1px solid #d3d3d3", display: "none" }}></canvas>
						<video width={480} src={videoSrc} controls></video>
					</div>
				</div>
			</div>
		</div>
	);
}

export default SvgToVideo;
