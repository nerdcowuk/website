import type { Metadata } from "next";
import "./globals.css";

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
		<html lang="en">
			<body>
				{children}
			</body>
		</html>
	);
}
