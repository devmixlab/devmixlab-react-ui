import { Card as CardBase, type CardComponent } from './Card';
import { Header } from './Header';
import { Body } from './Body';
import { Footer } from './Footer';
import { CompMedia } from './media';
import { Content } from './Content';
import { Section } from './Section';

// Attach subcomponents
const CompCard = CardBase as CardComponent;

CompCard.Header = Header;
CompCard.Body = Body;
CompCard.Footer = Footer;
CompCard.Media = CompMedia;
CompCard.Content = Content;
CompCard.Section = Section;

export { CompCard as Card };
