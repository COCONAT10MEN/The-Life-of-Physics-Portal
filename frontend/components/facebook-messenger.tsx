'use client';

import { FacebookProvider, CustomChat } from 'react-facebook';
import { useEffect, useState } from 'react';

const FacebookMessenger = () => {
	const [isMounted, setIsMounted] = useState(false);

	useEffect(() => {
		setIsMounted(true);
	}, []);

	if (!isMounted) {
		return null;
	}

	return (
		<FacebookProvider appId="581157280804465" chatSupport>
			<CustomChat pageId="174241062434285" minimized={true} />
		</FacebookProvider>
	);
};

export default FacebookMessenger;
