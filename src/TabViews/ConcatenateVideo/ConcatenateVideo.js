import { useState } from "react";
import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";


function ConcatenateVideo() {
	const [HiResVideoList, setHiResVideoList] = useState([
		"https://dev-vv-hotstar-output.s3.ap-northeast-1.amazonaws.com/slates/Four.mp4",
		"https://dev-vv-hotstar-output.s3.ap-northeast-1.amazonaws.com/clips/a042bddf-2be0-4c5b-b3ae-c7b90bfdbf25/59e36bd3-ec38-4913-a769-c750efd7e598/clip4.mp4",
		"https://dev-vv-hotstar-output.s3.ap-northeast-1.amazonaws.com/clips/a042bddf-2be0-4c5b-b3ae-c7b90bfdbf25/0e38d0c6-e387-4d19-8114-4e92f35278c1/clip3.mp4",
		"https://dev-vv-hotstar-output.s3.ap-northeast-1.amazonaws.com/clips/3d555956-c205-4357-b79b-a6ea696b4be8/3612352c-0963-4138-b8b5-6837085adaa1/test.mp4",
		"https://dev-vv-hotstar-output.s3.ap-northeast-1.amazonaws.com/slates/Out.mp4"
	]);

	const [LoResVideoList, setLoResVideoList] = useState([
		"https://dev-vv-hotstar-output.s3.ap-northeast-1.amazonaws.com/slates/Four.mp4",
		"https://dev-vv-hotstar-output.s3.ap-northeast-1.amazonaws.com/op/04ac4d9f-acd9-4b0f-80ec-e09bc587d8df/5ae49d1f-2610-4c3e-87b8-cd8cc241ef5e/426x240/part_11.mp4",
		"https://dev-vv-hotstar-output.s3.ap-northeast-1.amazonaws.com/op/04ac4d9f-acd9-4b0f-80ec-e09bc587d8df/5ae49d1f-2610-4c3e-87b8-cd8cc241ef5e/426x240/part_12.mp4",
		"https://dev-vv-hotstar-output.s3.ap-northeast-1.amazonaws.com/op/04ac4d9f-acd9-4b0f-80ec-e09bc587d8df/5ae49d1f-2610-4c3e-87b8-cd8cc241ef5e/426x240/part_13.mp4",
		"https://dev-vv-hotstar-output.s3.ap-northeast-1.amazonaws.com/slates/Out.mp4"

		// "https://dev-vv-hotstar-output.s3.ap-northeast-1.amazonaws.com/slates/Four.mp4",
		// "https://dev-vv-hotstar-output.s3.ap-northeast-1.amazonaws.com//test1/low_clip1",
		// "https://dev-vv-hotstar-output.s3.ap-northeast-1.amazonaws.com//test1/low_clip2",
		// "https://dev-vv-hotstar-output.s3.ap-northeast-1.amazonaws.com/slates/Out.mp4"
	]);

	const [message, setMessage] = useState("Click Start to transcode");
	const [videoUrl, setVideoUrl] = useState('');


	const ffmpeg = createFFmpeg({
		corePath: 'https://unpkg.com/@ffmpeg/core@0.11.0/dist/ffmpeg-core.js',
		log: true
	});



	async function concVideo() {
		// loading FFMPEG core
		await ffmpeg.load();
		
		setMessage("Start Concat")
			
		const inputPaths = [];

		const videoList = LoResVideoList;
			
		for (let i=0; i<=videoList.length; i+=1) {
			ffmpeg.FS('writeFile', `test-${i}`, await fetchFile(videoList[i]));
			inputPaths.push(`file test-${i}`);
		}
		ffmpeg.FS('writeFile', 'concat_list.txt', inputPaths.join('\n'));

		await ffmpeg.run('-f', 'concat', '-safe', '0', '-i', 'concat_list.txt', "-c", "copy", 'output.mp4');

		// await ffmpeg.run("-i", await fetchFile(videoList[0]), "-i", await fetchFile(videoList[1]), "-i", await fetchFile(videoList[2]), "-i", await fetchFile(videoList[3]), "-filter_complex", "[0:0] [0:1] [0:2] [1:0] [1:1] [1:2] [2:0] [2:1] [2:2] concat=n=3:v=1:a=2 [v] [a1] [a2]", "-map", '[v]', "-map", '[a1]', "-map", '[a2]', "output.mp4");

		// await ffmpeg.run("-i", `concat:${await fetchFile(videoList[0])}|${await fetchFile(videoList[1])}|${await fetchFile(videoList[2])}`, "-codec", "copy", "output.mp4");
		
		setMessage("Complete Concat");

		const data = ffmpeg.FS('readFile', 'output.mp4');

		const blob = new Blob([data.buffer], { type: "video/mp4" });
		const file = await fetch(blob).then(blobFile => new File([blobFile], `filename`, { type: "video/mp4" }));

		console.log('file: ', file);
		setVideoUrl(URL.createObjectURL(blob))
	};

	return(
		<div style={{display:'flex',flexDirection:'column',rowGap:'20px',margin:'24px'}}>
			<video width={480} src={videoUrl} controls/>
			<button style={{width:'120px'}} onClick={concVideo}>Start</button>
			<p>{message}</p>
		</div>
	) 
}

export default ConcatenateVideo