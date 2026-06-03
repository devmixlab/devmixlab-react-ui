import { Media, type MediaComponent } from './Media';
import { Image } from './Image';
import { Icon } from './Icon';
import { Hero } from './Hero';

// Attach subcomponents
const CompMedia = Media as MediaComponent;

CompMedia.Image = Image;
CompMedia.Icon = Icon;
CompMedia.Hero = Hero;

// export const CompMedia = Object.assign(Media, {
//     Image,
//     Icon,
// }) as MediaComponent;

export { CompMedia };
