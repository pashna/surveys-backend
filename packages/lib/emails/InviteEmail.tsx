import { Container, Text } from "@react-email/components";

import { EmailButton } from "./EmailButton";
import { EmailFooter } from "./EmailFooter";

interface InviteEmail {
  inviteeName: string;
  inviterName: string;
  verifyLink: string;
}

export const InviteEmail = ({ inviteeName, inviterName, verifyLink }: InviteEmail) => {
  return (
    <Container>
      <Text>Hey {inviteeName},</Text>
      <Text>
        Your colleague {inviterName} invited you to join them at Formbricks. To accept the invitation, please
        click the link below:
      </Text>
      <EmailButton label="Join team" href={verifyLink} />
      <EmailFooter />
    </Container>
  );
};
