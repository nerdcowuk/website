import type { Metadata } from "next";
import { Lora } from "next/font/google";
import localFont from "next/font/local";
import Box from '@/components/primitives/Box';
import "@/styles/globals.scss";

// Google Font: Lora (body font)
const lora = Lora({
	subsets: ["latin"],
	weight: ["400", "500", "700"],
	variable: "--font-lora",
	display: "swap",
});

// Local Font: Tandelle (display font)
const tandelle = localFont({
	src: [
		{
			path: "../../public/fonts/Tandelle-Regular.woff2",
			weight: "400",
			style: "normal",
		},
		{
			path: "../../public/fonts/Tandelle-Bold.woff2",
			weight: "700",
			style: "normal",
		},
	],
	variable: "--font-tandelle",
	display: "swap",
});

export const metadata: Metadata = {
	title: "NerdCow Headless",
	description: "Big damage website lets goooo.",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" className={`${lora.variable} ${tandelle.variable}`}>
			<body>
				<Box id="page">
					{/* Header will come here like navigation, announcements, etc */}
					<Box as="main" id="content">
						{children}
					</Box>
				</Box>
			</body>
		</html>
	);
}
