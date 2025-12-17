import cn from 'classnames';
import { ReactNode } from 'react';
import Box from "@/components/blocks/Box/Box"
import Text from "@/components/blocks/Text/Text"
import styles from './InfoBox.module.scss';
import Icon from '@/components/blocks/Icon';
import InfoIcon from '@/components/blocks/Icon/svg/info.svg';

interface InfoBoxProps {
    className?: string,
    children: React.ReactNode,
    [key: string]: any;
}

export default function InfoBox({
    title,
    children,
    className,
    ...restProps
}: InfoBoxProps) {
    const classNames = cn(
        styles[`ncos-info-box`],
        className,
    );

    return (
        <Box className={classNames} {...restProps}>
            <Box className={styles['ncos-info-box__title']}>
                <Icon icon={InfoIcon} size={24} />
                <Text as="label" preset="label">{title}</Text>
            </Box>
            <Box className={styles['ncos-info-box__body']}>
                {children}
            </Box>
        </Box>
    );
}
